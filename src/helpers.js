"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processValue = void 0;
const Expression_1 = require("./Expression");
function processValue(value) {
    if (value instanceof Expression_1.Expression) {
        return value;
    }
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        return value;
    }
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    return value;
}
exports.processValue = processValue;
