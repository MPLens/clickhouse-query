import {ClickHouseClient} from '@clickhouse/client';
import {Logger} from 'winston';
import {FilterableQuery, Operator, WherePart, WhereValueCondition, Expression} from './internal';
import Stream from 'stream';

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

export class Query extends FilterableQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;
    private withPart: [Selectable | Query | string | null, string | null] = [null, null];
    private selectPart: SelectParams = '*';
    private fromPart: [string | Query, string | null] | null = null;
    private isFinal: boolean = false;
    private havingPart: WherePart = [];
    private groupByPart: Array<string> | null = null;
    private orderByPart: Array<OrderBy> | null = null;
    private limitPart: number | string | null = null;
    private offsetPart: number | string | null = null;
    private joinPart: Array<[JoinOperator, Query | string, string, string]> = [];
    private aliasPart: [string, 'first' | 'last'] | null = null;

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null) {
        super();
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

    public as(alias: string, position: 'first' | 'last' = 'last') {
        if (position !== 'first' && position !== 'last') {
            throw new Error('Position must be "first" or "last"');
        }
        this.aliasPart = [alias, position];
        return this;
    }

    public from(table: string | Query, alias: string | null = null) {
        this.fromPart = [table, alias];
        return this;
    }

    /**
     * Generates SQL query with FINAL keyword.
     * Useful for tables which use ReplacingMergeTree engine to get rid-off duplicate entries.
     * @link https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replacingmergetree
     */
    public final() {
        this.isFinal = true;
        return this;
    }

    public join(operator: JoinOperator, rightTable: Query | string, alias: string, on: string) {
        if (operator === 'JOIN') {
            operator = 'INNER JOIN';
        }
        this.joinPart.push([operator, rightTable, alias, on]);
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

    public having(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.havingPart.push(['AND', column, operator, value]);
        return this;
    }

    public andHaving(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.havingPart.push(['AND', column, operator, value]);
        return this;
    }

    public orHaving(column: string | Expression, operator: Operator | null = null, value: WhereValueCondition = null) {
        this.havingPart.push(['OR', column, operator, value]);
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
            const [table, alias] = this.fromPart;
            if (table instanceof Query) {
                sql += ' FROM (' + table.generateSql() + ')';
                if (alias) {
                    sql += ` AS ${alias}`;
                }
            } else {
                sql += ` FROM ${table}`;
                sql += alias ? ` ${alias}` : '';
                if (this.isFinal) {
                    sql += ' FINAL';
                }
            }
        }

        if (this.joinPart.length > 0) {
            this.joinPart.forEach(([operator, rightTable, alias, on]) => {
                sql += ` ${operator} `;
                if (rightTable instanceof Query) {
                    sql += `(${rightTable.generateSql()}) AS ${alias}`;
                } else {
                    sql += `${rightTable} ${alias}`;
                }
                sql += ` ON ${on}`;
            });
        }

        if (this.hasWhereConditions()) {
            sql += ` ${this.generateWhere()}`;
        }

        if (this.groupByPart && this.groupByPart.length) {
            sql += ` GROUP BY ${this.groupByPart.join(', ')}`;
        }

        if (this.havingPart.length) {
            sql += ` HAVING ${this.buildWhereConditionsFromObject(this.havingPart)}`;
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
                        if (hasInnerWithStatement) {
                            withChunks.push(`(${part.generateSql()})`);
                        } else {
                            withChunks.push(part.generateSql())
                        }
                    } else {
                        withChunks.push(part);
                    }
                }
                preparedWithPart = `WITH ${withChunks.join(', ')}`;
                if (alias) {
                    preparedWithPart += ` AS ${alias}`;
                }
            } else if (typeof withPart === 'string') {
                preparedWithPart = `WITH '${withPart}'`;
                if (alias) {
                    preparedWithPart += ` AS ${alias}`;
                }
            } else if (withPart instanceof Query) {
                const hasInnerWithStatement = withPart.withPart[0];
                if (hasInnerWithStatement) {
                    preparedWithPart = `WITH (${withPart.generateSql()}) ${(alias ? `AS ${alias}` : '')}`;
                } else {
                    preparedWithPart = `WITH ${(alias ? `${alias} AS` : '')} (${withPart.generateSql()})`;
                }
            }
            sql = `${preparedWithPart} ${sql}`;
        } else {
            if (this.aliasPart) {
                const [alias, position] = this.aliasPart;
                if (position === 'first') {
                    sql = `${alias} AS (${sql})`;
                } else {
                    sql = `(${sql}) AS ${alias}`;
                }
            }
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
        const res = await this.connection.query({
            query: sql,
            query_params: params,
            format: 'JSONEachRow'
        });
        return res.json<Response>();
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
