import {FilterableQuery} from './internal';
import {expr} from './index';
import {LoggerLike} from './LoggerLike';
import {ClickHouseLike} from './ClickhouseLike';

export class DeleteQuery extends FilterableQuery {
    private readonly connection: ClickHouseLike;
    private readonly logger: LoggerLike | null;

    private tablePart: string | null = null;

    constructor(ch: ClickHouseLike, logger: LoggerLike | null) {
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
