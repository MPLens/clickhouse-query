import {ClickHouse} from 'clickhouse';
import {Expression} from './Expression';
import {Logger} from 'winston';
import {processValue} from './helpers';

type Operator =
    '='
    | '<'
    | '>'
    | '>='
    | '<='
    | '!='
    | 'BETWEEN'
    | 'IN'
    | 'NOT IN'
    | 'LIKE'
    | 'NOT LIKE'
    | 'IS NULL'
    | 'IS NOT NULL';

type WhereValueCondition =
    | string
    | number // Used for specific value matching
    | [string, string] // Used for BETWEEN
    | [number, number] // Used for BETWEEN
    | number[] // Used for IN/NOT IN
    | string[] // Used for IN/NOT IN
    | Expression // Used for custom expressions
    | null;
type WhereGroupConditions = 'AND' | 'OR';
type WhereCondition = [WhereGroupConditions, string | Expression, Operator | null, WhereValueCondition];
type WhereConditionGrouped = [WhereGroupConditions, Array<WhereCondition>];

type Selectable = Array<string | String | Query> | string;
type SelectParams = Selectable | '*';

type OrderBy = [string, 'ASC' | 'DESC'];

type JoinOperator =
    | 'JOIN'
    | 'INNER JOIN'
    | 'LEFT OUTER JOIN'
    | 'RIGHT OUTER JOIN'
    | 'FULL OUTER JOIN'
    | 'CROSS JOIN'
    | 'LEFT SEMI JOIN'
    | 'RIGHT SEMI JOIN'
    | 'LEFT ANTI JOIN'
    | 'RIGHT ANTI JOIN'
    | 'LEFT ANY JOIN'
    | 'RIGHT ANY JOIN'
    | 'INNER ANY JOIN'
    | 'ASOF JOIN'
    | 'LEFT ASOF JOIN';

export class Query {
    private readonly connection: ClickHouse;
    private readonly logger: Logger | null;
    private withPart: [Selectable | Query | string | null, string | null] = [null, null];
    private selectPart: SelectParams = '*';
    private fromPart: [string | Query, string | null] | null = null;
    private wherePart: Array<WhereCondition | WhereConditionGrouped> = [];
    private groupByPart: Array<string> | null = null;
    private orderByPart: Array<OrderBy> | null = null;
    private limitPart: number | string | null = null;
    private offsetPart: number | string | null = null;
    private joinPart: Array<[JoinOperator, Query, string, string]> = [];
    private aliasPart: string | null = null;

    constructor(ch: ClickHouse, logger: Logger | null) {
        this.connection = ch;
        this.logger = logger;
    }

    public with(params: Selectable | Query, alias: string | null = null) {
        this.withPart = [params, alias];
        return this;
    }

    public select(params: SelectParams) {
        this.selectPart = params;
        return this;
    }

    public as(alias: string) {
        this.aliasPart = alias;
        return this;
    }

    public from(table: string | Query, alias: string | null = null) {
        this.fromPart = [table, alias];
        return this;
    }

    public where(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.wherePart.push(['AND', column, operator, value]);
        return this;
    }

    public andWhere(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.wherePart.push(['AND', column, operator, value]);
        return this;
    }

    public orWhere(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.wherePart.push(['OR', column, operator, value]);
        return this;
    }

    public andWhereGroup(
        groupOperator: WhereGroupConditions,
        conditions: Array<[column: string, operator: Operator | null, value: WhereValueCondition]>
    ) {
        const andConditions: Array<WhereCondition> = conditions.map(([column, operator, value]) => {
            return [groupOperator, column, operator, value];
        });
        this.wherePart.push(['AND', andConditions]);
        return this;
    }

    public orWhereGroup(
        groupOperator: WhereGroupConditions,
        conditions: Array<[column: string, operator: Operator | null, value: WhereValueCondition]>
    ) {
        const orConditions: Array<WhereCondition> = conditions.map(([column, operator, value]) => {
            return [groupOperator, column, operator, value];
        })
        this.wherePart.push(['OR', orConditions]);
        return this;
    }

    public join(operator: JoinOperator, query: Query, alias: string, on: string) {
        if (operator === 'JOIN') {
            operator = 'INNER JOIN';
        }
        this.joinPart.push([operator, query, alias, on]);
        return this;
    }

    public offset(offset: number | string) {
        this.offsetPart = offset;
        return this;
    }

    public limit(limit: number | string) {
        this.limitPart = limit;
        return this;
    }

    public groupBy(columns: Array<string>) {
        this.groupByPart = columns;
        return this;
    }

    public orderBy(params: Array<OrderBy>) {
        this.orderByPart = params;
        return this;
    }

    public clone(): Query {
        const queryClone = new Query(this.connection, this.logger);
        Object.assign(queryClone, this);
        return queryClone;
    }

    public generateSql(): string {
        if (!this.selectPart) {
            throw new Error('SELECT is required');
        }

        let sql = 'SELECT ';
        if (typeof this.selectPart === 'string') {
            sql += this.selectPart;
        } else if (this.selectPart?.length) {
            const selectChunks = [];
            for (let i = 0; i < this.selectPart.length; i++) {
                const part = this.selectPart[i];
                if (part instanceof Query) {
                    selectChunks.push(part.generateSql());
                } else {
                    selectChunks.push(part);
                }
            }
            sql += selectChunks.join(', ');
        }

        if (this.fromPart) {
            if (this.fromPart[0] instanceof Query) {
                sql += ' FROM (' + this.fromPart[0].generateSql() + ')';
            } else {
                sql += ` FROM ${this.fromPart[0]}`;
            }
            if (this.fromPart[1]) {
                sql += ` AS ${this.fromPart[1]}`;
            }
        }

        if (this.joinPart.length > 0) {
            this.joinPart.forEach(([operator, query, alias, on]) => {
                sql += ` ${operator} `;
                if (query instanceof Query) {
                    sql += '(' + query.generateSql() + ')';
                } else {
                    sql += query;
                }
                sql += ` AS ${alias} ON ${on}`;
            });
        }

        if (this.wherePart.length) {
            sql += ' WHERE ';
            const whereChunks: Array<String> = [];
            this.wherePart.forEach((condition, index) => {
                const hasPrev = !!this.wherePart[index - 1];
                const hasNext = !!this.wherePart[index + 1];
                if (
                    !(condition[1] instanceof Expression) &&
                    ['AND', 'OR'].includes(condition[0]) && Array.isArray(condition[1])
                ) {
                    const fullGroupCondition = condition[0] as 'AND' | 'OR';
                    const groupCondition = condition[1][0][0]; // first (AND/OR) condition in group
                    const groupedConditions = condition[1] as Array<WhereCondition>;
                    const groupedWhereChunks: Array<string> = [];
                    groupedConditions.forEach((condition) => {
                        groupedWhereChunks.push(this.buildWhereCondition(condition));
                    });
                    if (hasPrev) {
                        whereChunks.splice(-1);
                        whereChunks.push(fullGroupCondition);
                    }
                    whereChunks.push(`(${groupedWhereChunks.join(` ${groupCondition} `)})`);
                    whereChunks.push(fullGroupCondition);
                } else {
                    if (hasPrev) {
                        whereChunks.splice(-1);
                        whereChunks.push(condition[0]);
                    }
                    whereChunks.push(`${this.buildWhereCondition(condition as WhereCondition)}`);
                    whereChunks.push(condition[0]);
                }
            });
            whereChunks.splice(-1);
            sql += whereChunks.join(' ');
        }

        if (this.groupByPart && this.groupByPart.length) {
            sql += ` GROUP BY ${this.groupByPart.join(', ')}`;
        }

        if (this.orderByPart && this.orderByPart.length > 0) {
            const orderClause = this.orderByPart.map(([column, direction]) => `${column} ${direction}`).join(', ');
            sql += ` ORDER BY ${orderClause}`;
        }


        if (this.offsetPart !== null && this.limitPart !== null) {
            sql += ` OFFSET ${this.offsetPart} ROW FETCH FIRST ${this.limitPart} ROWS ONLY`;
        } else if (this.offsetPart === null && this.limitPart !== null) {
            sql += ` LIMIT ${this.limitPart}`;
        }


        if (this.withPart[0]) {
            const [withPart, alias] = this.withPart;
            let preparedWithPart: string | null = null;
            if (Array.isArray(withPart)) {
                const withChunks = [];
                for (let i = 0; i < withPart.length; i++) {
                    const part = withPart[i];
                    if (part instanceof Query) {
                        const hasInnerWithStatement = !!part.withPart[0];
                        if(hasInnerWithStatement) {
                            withChunks.push(`(${part.generateSql()})`);
                        } else {
                            withChunks.push(part.generateSql())
                        }
                    } else {
                        withChunks.push(part);
                    }
                }
                preparedWithPart = `WITH ${withChunks.join(', ')}`;
            } else if (typeof withPart === 'string') {
                preparedWithPart = `WITH '${withPart}'`;
            } else if (withPart instanceof Query) {
                const hasInnerWithStatement = withPart.withPart[0];
                if (hasInnerWithStatement) {
                    preparedWithPart = `WITH (${withPart.generateSql()})`;
                } else {
                    preparedWithPart = `WITH ${withPart.generateSql()}`;
                }
            }
            if (alias) {
                preparedWithPart = `${preparedWithPart} AS ${alias}`;
            }
            sql = `${preparedWithPart} ${sql}`;
        } else {
            if (this.aliasPart) {
                sql = `(${sql}) AS ${this.aliasPart}`;
            }
        }

        return sql;
    }

    private buildWhereCondition(whereCondition: WhereCondition) {
        const [, column, operator, value] = whereCondition;
        let sql = `${column}`;

        if (operator) {
            sql += ` ${operator}`;
        }

        switch (operator) {
            case '=':
            case '>':
            case '<':
            case '<=':
            case '>=':
            case '!=':
                if (typeof value !== 'number' && typeof value !== 'string' && !(value instanceof Expression)) {
                    throw new Error(`"${operator}" only supports string or number, given: ${typeof value}`);
                }
                if (typeof value === 'string') {
                    sql += ` ${processValue(value)}`;
                }
                if (typeof value === 'number') {
                    sql += ` ${value}`;
                }
                if (value instanceof Expression) {
                    sql += ` ${value}`;
                }
                break;
            case 'BETWEEN':
                if (!Array.isArray(value)) {
                    throw new Error('Value for ' + operator + ' operator must be an array');
                }
                if (Array.isArray(value) && value.length !== 2) {
                    throw new Error('Value for ' + operator + ' operator must be an array with 2 elements');
                }

                if (Array.isArray(value) && typeof value[0] !== typeof value[0]) {
                    throw new Error(
                        'Value for ' + operator + ' operator must be an array with 2 elements of the same type'
                    );
                }

                if (Array.isArray(value)) {
                    if (typeof value[0] === 'string' && typeof value[1] === 'string') {
                        sql += ` ${processValue(value[0])} AND ${processValue(value[1])}`;
                    } else {
                        sql += ` ${value[0]} AND ${value[1]}`;
                    }
                }
                break;
            case 'IN':
            case 'NOT IN':
                if (!Array.isArray(value)) {
                    throw new Error('Value for ' + operator + ' operator must be an array');
                }
                sql += ` (${value.map((v) => processValue(v)).join(', ')})`;
                break;
            case 'LIKE':
            case 'NOT LIKE':
                if (typeof value !== 'string') {
                    throw new Error('Value for ' + operator + ' operator must be a string');
                }
                sql += ` ${processValue(value)}`;
                break;
        }
        return sql;
    }

    public async execute<Response extends Object[]>(
        params: Record<string, string | number | undefined> = {}
    ): Promise<Response> {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query template: ' + sql);
            this.logger.info('ClickHouse query SQL: ' + this.replaceParamsWithValues(sql, params));
        }
        return await (this.connection.query(sql, {params}).toPromise() as Promise<Response>);
    }

    private replaceParamsWithValues(sql: string, params: Record<string, string | number | undefined>) {
        const parsedParams = sql.match(/{([A-z0-9]+):(.*?)}/g);
        if (parsedParams && parsedParams.length > 0) {
            parsedParams.forEach((param) => {
                const [key, type] = param.replace(/[{}]/g, '').split(':');
                switch (type) {
                    case 'String':
                    case 'Date':
                    case 'Date32':
                    case 'DateTime':
                    case 'FixedString':
                        sql = sql.replace(param, `'${params[key]}'`);
                        break;
                    case 'Int8':
                    case 'UInt8':
                    case 'Int16':
                    case 'UInt16':
                    case 'Int32':
                    case 'UInt32':
                    case 'Int64':
                    case 'UInt64':
                    case 'Int128':
                    case 'UInt128':
                    case 'Int256':
                    case 'UInt256':
                    case 'Float32':
                    case 'Float64':
                    case 'Decimal64':
                    case 'Decimal128':
                    case 'Boolean':
                        sql = sql.replace(param, `${params[key]}`);
                        break;
                }
            });
        }

        return sql;
    }
}
