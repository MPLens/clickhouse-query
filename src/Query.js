"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const Expression_1 = require("./Expression");
const helpers_1 = require("./helpers");
class Query {
    constructor(ch, logger) {
        this.withPart = null;
        this.selectPart = '*';
        this.fromPart = null;
        this.wherePart = [];
        this.groupByPart = null;
        this.orderByPart = null;
        this.limitPart = null;
        this.offsetPart = 0;
        this.joinPart = [];
        this.aliasPart = null;
        this.connection = ch;
        this.logger = logger;
    }
    with(params) {
        this.withPart = params;
        return this;
    }
    select(params) {
        this.selectPart = params;
        return this;
    }
    as(alias) {
        this.aliasPart = alias;
        return this;
    }
    from(table, alias = null) {
        this.fromPart = [table, alias];
        return this;
    }
    where(column, operator = null, value = null) {
        this.wherePart.push(['AND', column, operator, value]);
        return this;
    }
    andWhere(column, operator = null, value = null) {
        this.wherePart.push(['AND', column, operator, value]);
        return this;
    }
    orWhere(column, operator = null, value = null) {
        this.wherePart.push(['OR', column, operator, value]);
        return this;
    }
    andWhereGroup(groupOperator, conditions) {
        const andConditions = conditions.map(([column, operator, value]) => {
            return [groupOperator, column, operator, value];
        });
        this.wherePart.push(['AND', andConditions]);
        return this;
    }
    orWhereGroup(groupOperator, conditions) {
        const orConditions = conditions.map(([column, operator, value]) => {
            return [groupOperator, column, operator, value];
        });
        this.wherePart.push(['OR', orConditions]);
        return this;
    }
    join(operator, query, alias, on) {
        if (operator === 'JOIN') {
            operator = 'INNER JOIN';
        }
        this.joinPart.push([operator, query, alias, on]);
        return this;
    }
    offset(offset) {
        this.offsetPart = offset;
        return this;
    }
    limit(limit) {
        this.limitPart = limit;
        return this;
    }
    groupBy(columns) {
        this.groupByPart = columns;
        return this;
    }
    orderBy(params) {
        this.orderByPart = params;
        return this;
    }
    clone() {
        const queryClone = new Query(this.connection, this.logger);
        Object.assign(queryClone, this);
        return queryClone;
    }
    generateSql() {
        var _a;
        if (!this.selectPart) {
            throw new Error('SELECT is required');
        }
        let sql = 'SELECT ';
        if (typeof this.selectPart === 'string') {
            sql += this.selectPart;
        }
        else if ((_a = this.selectPart) === null || _a === void 0 ? void 0 : _a.length) {
            const selectChunks = [];
            for (let i = 0; i < this.selectPart.length; i++) {
                const part = this.selectPart[i];
                if (part instanceof Query) {
                    selectChunks.push(part.generateSql());
                }
                else {
                    selectChunks.push(part);
                }
            }
            sql += selectChunks.join(', ');
        }
        if (this.fromPart) {
            if (this.fromPart[0] instanceof Query) {
                sql += ' FROM (' + this.fromPart[0].generateSql() + ')';
            }
            else {
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
                }
                else {
                    sql += query;
                }
                sql += ` AS ${alias} ON ${on}`;
            });
        }
        if (this.wherePart.length) {
            sql += ' WHERE ';
            const whereChunks = [];
            this.wherePart.forEach((condition, index) => {
                const hasPrev = !!this.wherePart[index - 1];
                const hasNext = !!this.wherePart[index + 1];
                if (!(condition[1] instanceof Expression_1.Expression) &&
                    ['AND', 'OR'].includes(condition[0]) && Array.isArray(condition[1])) {
                    const fullGroupCondition = condition[0];
                    const groupCondition = condition[1][0][0]; // first (AND/OR) condition in group
                    const groupedConditions = condition[1];
                    const groupedWhereChunks = [];
                    groupedConditions.forEach((condition) => {
                        groupedWhereChunks.push(this.buildWhereCondition(condition));
                    });
                    if (hasPrev) {
                        whereChunks.splice(-1);
                        whereChunks.push(fullGroupCondition);
                    }
                    whereChunks.push(`(${groupedWhereChunks.join(` ${groupCondition} `)})`);
                    whereChunks.push(fullGroupCondition);
                }
                else {
                    if (hasPrev) {
                        whereChunks.splice(-1);
                        whereChunks.push(condition[0]);
                    }
                    whereChunks.push(`${this.buildWhereCondition(condition)}`);
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
        }
        if (this.withPart && this.withPart.length > 0) {
            const withChunks = [];
            for (let i = 0; i < this.withPart.length; i++) {
                const part = this.withPart[i];
                if (part instanceof Query) {
                    withChunks.push(part.generateSql());
                }
                else {
                    withChunks.push(part);
                }
            }
            const withPart = `WITH ${withChunks.join(', ')}`;
            sql = `${withPart} ${sql}`;
            if (this.aliasPart) {
                sql += ` AS ${this.aliasPart}`;
            }
        }
        else {
            if (this.aliasPart) {
                sql = `(${sql}) AS ${this.aliasPart}`;
            }
        }
        return sql;
    }
    buildWhereCondition(whereCondition) {
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
                if (typeof value !== 'number' && typeof value !== 'string' && !(value instanceof Expression_1.Expression)) {
                    throw new Error(`"${operator}" only supports string or number, given: ${typeof value}`);
                }
                if (typeof value === 'string') {
                    sql += ` ${(0, helpers_1.processValue)(value)}`;
                }
                if (typeof value === 'number') {
                    sql += ` ${value}`;
                }
                if (value instanceof Expression_1.Expression) {
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
                    throw new Error('Value for ' + operator + ' operator must be an array with 2 elements of the same type');
                }
                if (Array.isArray(value)) {
                    if (typeof value[0] === 'string' && typeof value[1] === 'string') {
                        sql += ` ${(0, helpers_1.processValue)(value[0])} AND ${(0, helpers_1.processValue)(value[1])}`;
                    }
                    else {
                        sql += ` ${value[0]} AND ${value[1]}`;
                    }
                }
                break;
            case 'IN':
            case 'NOT IN':
                if (!Array.isArray(value)) {
                    throw new Error('Value for ' + operator + ' operator must be an array');
                }
                sql += ` (${value.map((v) => (0, helpers_1.processValue)(v)).join(', ')})`;
                break;
            case 'LIKE':
            case 'NOT LIKE':
                if (typeof value !== 'string') {
                    throw new Error('Value for ' + operator + ' operator must be a string');
                }
                sql += ` ${(0, helpers_1.processValue)(value)}`;
                break;
        }
        return sql;
    }
    execute(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = this.generateSql();
            this.logger.info('ClickHouse query template: ' + sql);
            this.logger.info('ClickHouse query SQL: ' + this.replaceParamsWithValues(sql, params));
            return yield this.connection.query(sql, { params }).toPromise();
        });
    }
    replaceParamsWithValues(sql, params) {
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
exports.Query = Query;
