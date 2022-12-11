"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expr = exports.fx = void 0;
const Expression_1 = require("./Expression");
const Functions_1 = require("./Functions");
exports.fx = new Functions_1.Functions();
function expr(value) {
    return new Expression_1.Expression(value);
}
exports.expr = expr;
