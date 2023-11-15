import {Logger} from 'winston';
import {schema} from './index';
import {ClickHouseClient} from '@clickhouse/client';
import Stream from 'stream';

export class CreateTableQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    private ifNotExistsPart: boolean = false;

    private columnsPart: Array<[column: string, type: string, expr: string | null, compressionCodec: string | null, ttl: string | null]> = [];

    private clusterPart: string | null = null;

    private enginePart: string | null = null;

    private orderByPart: Array<string> = [];

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null) {
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
        this.columnsPart.push([
            column,
            type,
            expr,
            compressionCodec,
            ttl
        ]);
        return this;
    }

    public onCluster(cluster: string): CreateTableQuery {
        this.clusterPart = cluster;
        return this;
    }

    public engine(engine: string): CreateTableQuery {
        this.enginePart = engine;
        return this;
    }

    public orderBy(columns: string[]): CreateTableQuery {
        this.orderByPart = columns;
        return this;
    }

    public generateSql(): string {
        if (this.tablePart === null) {
            throw new Error('No table specified to create');
        }

        if (this.columnsPart.length === 0) {
            throw new Error(`No columns specified for table ${this.tablePart}`);
        }

        if (this.enginePart === null) {
            throw new Error(`No engine specified for table ${this.tablePart}`);
        }

        let sql = 'CREATE TABLE';

        if (this.ifNotExistsPart) {
            sql += ' IF NOT EXISTS';
        }

        if (this.clusterPart) {
            sql += ` ON CLUSTER ${this.clusterPart}`;
        }

        sql += ` ${this.tablePart}`;

        if (this.columnsPart.length > 0) {
            sql += '(';
            sql += this.columnsPart.map(([column, type, expr, compressionCodec, ttl]) => {
                let columnResult = `${column} ${type}`;
                if (expr) {
                    columnResult += ` ${expr}`;
                }
                if (compressionCodec) {
                    columnResult += ` ${compressionCodec}`;
                }
                if (ttl) {
                    columnResult += ` ${ttl}`;
                }
                return columnResult;
            }).join(', ');
            sql += ')';
        }

        sql += ` ENGINE = ${this.enginePart}`;
        if (this.orderByPart.length > 0) {
            sql += ` ORDER BY (${this.orderByPart.join(', ')})`;
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
        })
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public nullable(type: string) {
        return schema.nullable(type);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int8() {
        return schema.int8();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int16() {
        return schema.int16();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int32() {
        return schema.int32();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int64() {
        return schema.int64();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int128() {
        return schema.int128();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public int256() {
        return schema.int256();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt8() {
        return schema.uInt8();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt16() {
        return schema.uInt16();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt32() {
        return schema.uInt32();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt64() {
        return schema.uInt64();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt128() {
        return schema.uInt128();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uInt256() {
        return schema.uInt256();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public float32() {
        return schema.float32();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public float64() {
        return schema.float64();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public decimal(precision: number, scale: number) {
        return schema.decimal(precision, scale);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public decimal32(precision: number, scale: number) {
        return schema.decimal32(precision, scale);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public decimal64(precision: number, scale: number) {
        return schema.decimal64(precision, scale);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public decimal128(precision: number, scale: number) {
        return schema.decimal128(precision, scale);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public decimal256(precision: number, scale: number) {
        return schema.decimal256(precision, scale);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public boolean() {
        return schema.boolean();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public string() {
        return schema.string();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public fixedString(length: number) {
        return schema.fixedString(length);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public uuid() {
        return schema.uuid();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public date() {
        return schema.date();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public date32() {
        return schema.date32();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public dateTime(timezone: string | null = null) {
        return schema.dateTime(timezone);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public dateTime64(precision: number, timezone: string | null = null) {
        return schema.dateTime64(precision, timezone);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public enum(values: Record<string, number> | string[]) {
        return schema.enum(values);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public enum8(values: Record<string, number> | string[]) {
        return schema.enum8(values);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public enum16(values: Record<string, number> | string[]) {
        return schema.enum16(values);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public lowCardinality(type: string) {
        return schema.lowCardinality(type);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public array(type: string) {
        return schema.array(type);
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public json() {
        return schema.json();
    }

    /**
     * @deprecated Use `import {schema} from 'clickhouse-query' instead. It would be removed in >= 2.0.0.
     */
    public tuple(types: Array<[name: string, type: string]>) {
        return schema.tuple(types);
    }
}
