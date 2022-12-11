"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = void 0;
const Expression_1 = require("./Expression");
const helpers_1 = require("./helpers");
class Functions {
    maybeConvertToColumn(value) {
        if (value instanceof Expression_1.Expression) {
            return value;
        }
        if (typeof value === 'string') {
            return new Expression_1.Expression(value);
        }
        return value;
    }
    /** Arrays **/
    anyLast(column) {
        return new Expression_1.Expression(`anyLast(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))})`);
    }
    anyLastPos(value, position) {
        return new Expression_1.Expression(`anyLast(${(0, helpers_1.processValue)(this.maybeConvertToColumn(value))})[${position}]`);
    }
    groupArray(column) {
        return new Expression_1.Expression(`groupArray(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))})`);
    }
    arrayJoin(column) {
        return new Expression_1.Expression(`arrayJoin(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))})`);
    }
    indexOf(column, haystack) {
        return new Expression_1.Expression(`indexOf(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))}, ${(0, helpers_1.processValue)(haystack)})`);
    }
    empty(column) {
        return new Expression_1.Expression(`empty(${(0, helpers_1.processValue)(column)})`);
    }
    /** Arrays end **/
    min(column) {
        return new Expression_1.Expression(`min(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))})`);
    }
    max(column) {
        return new Expression_1.Expression(`max(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))})`);
    }
    avg(value) {
        return new Expression_1.Expression(`avg(${(0, helpers_1.processValue)(this.maybeConvertToColumn(value))})`);
    }
    avgIf(column, condition) {
        return new Expression_1.Expression(`avgIf(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))}, ${condition})`);
    }
    sum(value) {
        return new Expression_1.Expression(`sum(${(0, helpers_1.processValue)(this.maybeConvertToColumn(value))})`);
    }
    count(value) {
        return new Expression_1.Expression(`count(${(0, helpers_1.processValue)(this.maybeConvertToColumn(value))})`);
    }
    countDistinct(value) {
        let normalizedValue;
        if (Array.isArray(value)) {
            normalizedValue = value.map((v) => (0, helpers_1.processValue)(this.maybeConvertToColumn(v))).join(', ');
        }
        else {
            normalizedValue = (0, helpers_1.processValue)(this.maybeConvertToColumn(value));
        }
        return new Expression_1.Expression(`count(DISTINCT ${normalizedValue})`);
    }
    countIf(condition) {
        return new Expression_1.Expression(`countIf(${(0, helpers_1.processValue)(this.maybeConvertToColumn(condition))})`);
    }
    abs(value) {
        return new Expression_1.Expression(`abs(${(0, helpers_1.processValue)(this.maybeConvertToColumn(value))})`);
    }
    if(condition, trueValue, falseValue) {
        return new Expression_1.Expression(`if(${condition}, ${(0, helpers_1.processValue)(this.maybeConvertToColumn(trueValue))}, ${(0, helpers_1.processValue)(this.maybeConvertToColumn(falseValue))})`);
    }
    round(column, precision) {
        return new Expression_1.Expression(`round(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))}, ${precision})`);
    }
    subtractDays(date, number) {
        return new Expression_1.Expression(`subtractDays(${date}, ${(0, helpers_1.processValue)(number)})`);
    }
    positionCaseInsensitive(haystack, needle) {
        return new Expression_1.Expression(`positionCaseInsensitive(${this.maybeConvertToColumn(haystack)}, ${(0, helpers_1.processValue)(needle)})`);
    }
    translateUTF8(column, from, to) {
        return new Expression_1.Expression(`translateUTF8(${(0, helpers_1.processValue)(this.maybeConvertToColumn(column))}, '${from}', '${to}')`);
    }
}
exports.Functions = Functions;
