import {ClickHouse} from 'clickhouse';
import {Query} from './Query';
import {Logger} from 'winston';
import {InsertQuery} from './InsertQuery';
import {DeleteQuery} from './DeleteQuery';
import {UpdateQuery} from './UpdateQuery';
import {CreateTableQuery} from './CreateTableQuery';


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

    public delete(): DeleteQuery {
        return new DeleteQuery(this.connection, this.logger);
    }

    public update(): UpdateQuery {
        return new UpdateQuery(this.connection, this.logger);
    }

    public createTable(): CreateTableQuery {
        return new CreateTableQuery(this.connection, this.logger);
    }
}
