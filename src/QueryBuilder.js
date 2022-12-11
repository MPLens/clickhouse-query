"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const Query_1 = require("./Query");
class QueryBuilder {
    constructor(ch, logger) {
        this.connection = ch;
        this.logger = logger;
    }
    query() {
        return new Query_1.Query(this.connection, this.logger);
    }
}
exports.QueryBuilder = QueryBuilder;
