"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expr = exports.fx = exports.Query = exports.QueryBuilder = void 0;
const Expression_1 = require("./Expression");
const Functions_1 = require("./Functions");
const QueryBuilder_1 = require("./QueryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return QueryBuilder_1.QueryBuilder; } });
const Query_1 = require("./Query");
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return Query_1.Query; } });
const fx = new Functions_1.Functions();
exports.fx = fx;
function expr(value) {
    return new Expression_1.Expression(value);
}
exports.expr = expr;
