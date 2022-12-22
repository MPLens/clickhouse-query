import {ClickHouse} from 'clickhouse';
import {Logger} from 'winston';
import {FilterableQuery} from './FilterableQuery';
import {expr} from './index';

export class DeleteQuery extends FilterableQuery {
    private readonly connection: ClickHouse;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    constructor(ch: ClickHouse, logger: Logger | null) {
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

    public async execute<Response>() {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query SQL: ' + sql);
        }
        return await (this.connection.query(sql).toPromise() as Promise<Response>);
    }
}
