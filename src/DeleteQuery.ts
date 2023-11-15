import {ClickHouseClient} from '@clickhouse/client';
import {Logger} from 'winston';
import {FilterableQuery} from './internal';
import {expr} from './index';
import Stream from 'stream';

export class DeleteQuery extends FilterableQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null) {
        super();
        this.connection = ch;
        this.logger = logger;
    }

    public table(table: string): DeleteQuery {
        this.tablePart = table;
        return this;
    }

    /**
     * Beware, this method will truncate the table.
     */
    public all(): DeleteQuery {
        this.where(expr('1'), '=', 1);
        return this;
    }

    public generateSql(): string {
        if (this.tablePart === null) {
            throw new Error('No table specified to delete');
        }
        return `ALTER TABLE ${this.tablePart} DELETE ${this.generateWhere()}`;
    }

    public async execute() {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query SQL: ' + sql);
        }
        await this.connection.command({query: sql});
    }
}
