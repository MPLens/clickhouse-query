import {Query} from './Query';
import {InsertQuery} from './InsertQuery';
import {DeleteQuery} from './DeleteQuery';
import {UpdateQuery} from './UpdateQuery';
import {CreateTableQuery} from './CreateTableQuery';
import {AlterTableQuery} from './AlterTable/AlterTableQuery';
import {ClickHouseLike} from './ClickhouseLike';
import {LoggerLike} from './LoggerLike';

export class QueryBuilder {
    private readonly connection: ClickHouseLike;
    private readonly logger: LoggerLike | null;

    constructor(ch: ClickHouseLike, logger: LoggerLike | null = null) {
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

    public alter(): AlterTableQuery {
        return new AlterTableQuery(this.connection, this.logger);
    }

    public createTable(): CreateTableQuery {
        return new CreateTableQuery(this.connection, this.logger);
    }
}
