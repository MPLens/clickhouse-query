"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expression = void 0;
class Expression extends String {
    constructor(cmd) {
        super(cmd);
    }
    static value(cmd) {
        return new Expression(cmd);
    }
    as(alias) {
        return `${this.valueOf()} AS ${alias}`;
    }
}
exports.Expression = Expression;
Expression.prototype.toString = function () {
    return this.valueOf();
};
