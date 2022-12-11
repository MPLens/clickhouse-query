import {ClickHouse} from 'clickhouse';
import {Query} from './Query';
import {Logger} from 'winston';

export class QueryBuilder {
    private readonly connection: ClickHouse;
    private readonly logger: Logger;

    constructor(ch: ClickHouse, logger: Logger) {
        this.connection = ch;
        this.logger = logger;
    }

    public query(): Query {
        return new Query(this.connection, this.logger);
    }
}
