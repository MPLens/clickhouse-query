import {Logger} from 'winston';
import {FilterableQuery} from '../internal';
import {AddColumn} from './AddColumn';
import {DropColumn} from './DropColumn';
import {RenameColumn} from './RenameColumn';
import {ClearColumn} from './ClearColumn';
import {CommentColumn} from './CommentColumn';
import {ModifyColumn} from './ModifyColumn';
import {ClickHouseClient} from '@clickhouse/client';
import Stream from 'stream';

export class AlterTableQuery extends FilterableQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;
    private clusterPart: string | null = null;

    private addColumnPart: AddColumn | null = null;
    private dropColumnPart: DropColumn | null = null;
    private renameColumnPart: RenameColumn | null = null;
    private clearColumnPart: ClearColumn | null = null;
    private commentColumnPart: CommentColumn | null = null;
    private modifyColumnPart: ModifyColumn | null = null;

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null = null) {
        super();
        this.connection = ch;
        this.logger = logger;
    }

    public table(table: string): AlterTableQuery {
        this.tablePart = table;
        return this;
    }

    public onCluster(cluster: string): AlterTableQuery {
        this.clusterPart = cluster;
        return this;
    }

    public addColumn(operation: AddColumn): AlterTableQuery {
        this.addColumnPart = operation;
        return this;
    }

    public dropColumn(operation: DropColumn): AlterTableQuery {
        this.dropColumnPart = operation;
        return this;
    }

    public renameColumn(operation: RenameColumn): AlterTableQuery {
        this.renameColumnPart = operation;
        return this;
    }

    public clearColumn(operation: ClearColumn): AlterTableQuery {
        this.clearColumnPart = operation;
        return this;
    }

    public commentColumn(operation: CommentColumn): AlterTableQuery {
        this.commentColumnPart = operation;
        return this;
    }

    public modifyColumn(operation: ModifyColumn): AlterTableQuery {
        this.modifyColumnPart = operation;
        return this;
    }

    public generateSql(): string {
        if (this.tablePart === null) {
            throw new Error('No table specified to alter');
        }

        if (this.addColumnPart === null &&
            this.dropColumnPart === null &&
            this.renameColumnPart === null &&
            this.clearColumnPart === null &&
            this.commentColumnPart === null &&
            this.modifyColumnPart === null
        ) {
            throw new Error('No alter operation specified, for example addColumn() or dropColumn()');
        }

        let sql = `ALTER TABLE ${this.tablePart}`;

        if (this.clusterPart) {
            sql += ` ON CLUSTER ${this.clusterPart}`;
        }

        if (this.addColumnPart !== null) {
            sql += ` ${this.addColumnPart}`;
        } else if (this.dropColumnPart !== null) {
            sql += ` ${this.dropColumnPart}`;
        } else if (this.renameColumnPart !== null) {
            sql += ` ${this.renameColumnPart}`;
        } else if (this.clearColumnPart !== null) {
            sql += ` ${this.clearColumnPart}`;
        } else if (this.commentColumnPart !== null) {
            sql += ` ${this.commentColumnPart}`;
        } else if (this.modifyColumnPart !== null) {
            sql += ` ${this.modifyColumnPart}`;
        }

        return sql;
    }

    public async execute() {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query SQL: ' + sql);
        }

        await this.connection.command({
            query: sql,
        });
    }
}
