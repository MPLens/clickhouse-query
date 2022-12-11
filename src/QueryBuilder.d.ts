import { ClickHouse } from 'clickhouse';
import { Query } from './Query';
import { Logger } from 'winston';
export declare class QueryBuilder {
    private readonly connection;
    private readonly logger;
    constructor(ch: ClickHouse, logger: Logger);
    query(): Query;
}
