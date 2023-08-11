import {Expression} from './Expression';
import {processValue} from './helpers';
import {Query} from './internal';

export type Operator =
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

export type WhereValueCondition =
    | string
    | number // Used for specific value matching
    | [string, string] // Used for BETWEEN
    | [number, number] // Used for BETWEEN
    | number[] // Used for IN/NOT IN
    | string[] // Used for IN/NOT IN
    | Query // // Used for IN/NOT IN
    | Expression // Used for custom expressions
    | null;
type WhereGroupConditions = 'AND' | 'OR';
type WhereCondition = [WhereGroupConditions, string | Expression, Operator | null, WhereValueCondition];
type WhereConditionGrouped = [WhereGroupConditions, Array<WhereCondition>];
export type WherePart = Array<WhereCondition | WhereConditionGrouped>;

export class FilterableQuery extends String {
    private wherePart: WherePart = [];

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

    public hasWhereConditions(): boolean {
        return this.wherePart.length > 0;
    }

    generateWhere(): string {
        let sql = 'WHERE ';
        sql += this.buildWhereConditionsFromObject(this.wherePart);
        return sql;
    }

    public buildWhereConditionsFromObject(whereObject: WherePart) {
        let sql = '';
        const whereChunks: Array<String> = [];
        whereObject.forEach((condition, index) => {
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
        return sql;
    }

    protected buildWhereCondition(whereCondition: WhereCondition) {
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
                if (Array.isArray(value)) {
                    sql += ` (${value.map((v) => processValue(v)).join(', ')})`;
                } else if (value instanceof Query) {
                    sql += ` (${value.generateSql()})`;
                } else {
                    throw new Error('Value for ' + operator + ' operator must be an array or Query object');
                }
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
}
