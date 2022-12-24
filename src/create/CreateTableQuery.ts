import {ClickHouse} from 'clickhouse';
import {Logger} from 'winston';

export class CreateTableQuery {
    private readonly connection: ClickHouse;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    private ifNotExistsPart: boolean = false;

    constructor(ch: ClickHouse, logger: Logger | null) {
        this.connection = ch;
        this.logger = logger;
    }

    public table(table: string): CreateTableQuery {
        this.tablePart = table;
        return this;
    }

    public ifNotExists(): CreateTableQuery {
        this.ifNotExistsPart = true;
        return this;
    }

    public column(
        column: string,
        type: string,
        expr: string | null = null,
        compressionCodec: string | null = null,
        ttl: string | null = null
    ): CreateTableQuery {
        this.columnsPart = columns;
        return this;
    }

    public generateSql(): string {
        if (this.tablePart === null) {
            throw new Error('No table specified to delete');
        }
        let sql = 'CREATE TABLE';

        if(this.ifNotExistsPart) {
            sql += ' IF NOT EXISTS';
        }
        sql+= ` ${this.tablePart}`;



        return sql;
    }

    public async execute<Response>() {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query SQL: ' + sql);
        }
        return await (this.connection.query(sql).toPromise() as Promise<Response>);
    }
}
