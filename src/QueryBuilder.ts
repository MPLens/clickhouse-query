import {ClickHouse} from 'clickhouse';
import {Query} from './Query';
import {Logger} from 'winston';
import {InsertQuery} from './InsertQuery';


export class QueryBuilder {
    private readonly connection: ClickHouse;
    private readonly logger: Logger | null;

    constructor(ch: ClickHouse, logger: Logger | null = null) {
        this.connection = ch;
        this.logger = logger;
    }

    public query(): Query {
        return new Query(this.connection, this.logger);
    }

    public insert(): InsertQuery {
        return new InsertQuery(this.connection, this.logger);
    }
}
