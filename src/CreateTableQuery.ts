import {ClickHouse} from 'clickhouse';
import {Logger} from 'winston';

export class CreateTableQuery {
    private readonly connection: ClickHouse;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    private ifNotExistsPart: boolean = false;

    private columnsPart: Array<[column: string, type: string, expr: string | null, compressionCodec: string | null, ttl: string | null]> = [];

    private clusterPart: string | null = null;

    private enginePart: string | null = null;

    private orderByPart: Array<string> = [];

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

    public async execute<Response>() {
        const sql = this.generateSql();
        if (this.logger !== null) {
            this.logger.info('ClickHouse query SQL: ' + sql);
        }
        return await (this.connection.query(sql).toPromise() as Promise<Response>);
    }

    // Helpers start
    public nullable(type: string) {
        return `Nullable(${type})`;
    }

    public int8() {
        return `Int8`;
    }

    public int16() {
        return `Int16`;
    }

    public int32() {
        return `Int32`;
    }

    public int64() {
        return `Int64`;
    }

    public int128() {
        return `Int128`;
    }

    public int256() {
        return `Int256`;
    }

    public uInt8() {
        return `UInt8`;
    }

    public uInt16() {
        return `UInt16`;
    }

    public uInt32() {
        return `UInt32`;
    }

    public uInt64() {
        return `UInt64`;
    }

    public uInt128() {
        return `UInt128`;
    }

    public uInt256() {
        return `UInt256`;
    }

    public float32() {
        return `Float32`;
    }

    public float64() {
        return `Float64`;
    }

    public decimal(precision: number, scale: number) {
        return `Decimal(${precision}, ${scale})`;
    }

    public decimal32(precision: number, scale: number) {
        return `Decimal32(${precision}, ${scale})`;
    }

    public decimal64(precision: number, scale: number) {
        return `Decimal64(${precision}, ${scale})`;
    }

    public decimal128(precision: number, scale: number) {
        return `Decimal128(${precision}, ${scale})`;
    }

    public decimal256(precision: number, scale: number) {
        return `Decimal256(${precision}, ${scale})`;
    }

    public boolean() {
        return `Bool`;
    }

    public string() {
        return `String`;
    }

    public fixedString(length: number) {
        return `FixedString(${length})`;
    }

    public uuid() {
        return `UUID`;
    }

    public date() {
        return `Date`;
    }

    public date32() {
        return `Date32`;
    }

    public dateTime(timezone: string | null = null) {
        if (timezone) {
            return `DateTime('${timezone}')`;
        }
        return `DateTime`;
    }

    public dateTime64(precision: number, timezone: string | null = null) {
        if (timezone) {
            return `DateTime64(${precision}, '${timezone}')`;
        }
        return `DateTime64(${precision})`;
    }

    public enum(values: Record<string, number> | string[]) {
        return this.enumInternal('Enum', values);
    }

    public enum8(values: Record<string, number> | string[]) {
        return this.enumInternal('Enum8', values);
    }

    public enum16(values: Record<string, number> | string[]) {
        return this.enumInternal('Enum16', values);
    }

    private enumInternal(enumType: string, values: Record<string, number> | string[]) {
        if (Array.isArray(values)) {
            return `${enumType}(${values.map((v) => `'${v}'`).join(', ')})`;
        }

        const enumParts = [];
        for (const key in values) {
            enumParts.push(`'${key}' = ${values[key]}`);
        }
        return `${enumType}(${enumParts.join(', ')})`;
    }

    public lowCardinality(type: string) {
        return `LowCardinality(${type})`;
    }

    public array(type: string) {
        return `Array(${type})`;
    }

    public json() {
        return 'JSON';
    }

    public tuple(types: Array<[name: string, type: string]>) {
        const tupleParts = [];
        for (const [name, type] of types) {
            tupleParts.push(`${name} ${type}`);
        }
        return `Tuple(${tupleParts.join(', ')})`;
    }

    // Helpers end
}
