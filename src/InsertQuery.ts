import {ClickHouseClient} from '@clickhouse/client';
import {Logger} from 'winston';
import {Query} from './Query';
import Stream from 'stream';

type Values<T extends Object> = Array<T> | Query;

export class InsertQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;

    private intoPart: string | null = null;
    private columnsPart: string[] | null = null;
    private valuesPart: Values<Object> | null = null;

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null) {
        this.connection = ch;
        this.logger = logger;
    }

    public into(table: string): InsertQuery {
        this.intoPart = table;
        return this;
    }

    public columns(columns: string[]): InsertQuery {
        this.columnsPart = columns;
        return this;
    }

    public values<T extends Object>(values: T | Array<T> | Query): InsertQuery {
        if (Array.isArray(this.valuesPart) && values instanceof Query) {
            throw new Error('Cannot mix array of values insert from query');
        }

        if (values instanceof Query) {
            this.valuesPart = values;
        } else if (Array.isArray(values)) {
            if (this.columnsPart === null) {
                this.columnsPart = Object.keys(values[0]);
            }
            this.valuesPart = Array.isArray(this.valuesPart)
                ? this.valuesPart.concat(values)
                : values;
        } else if (typeof values === 'object') {
            if (this.columnsPart === null) {
                this.columnsPart = Object.keys(values);
            }
            this.valuesPart = Array.isArray(this.valuesPart)
                ? this.valuesPart.concat(values)
                : [values]
        }

        return this;
    }

    public generateSql(): string {
        if (this.intoPart === null) {
            throw new Error('No table specified to insert into');
        }
        if (this.valuesPart === null) {
            throw new Error('No values specified to insert');
        }
        let sql = `INSERT INTO ${this.intoPart} `;
        if (this.columnsPart !== null) {
            sql += `(${this.columnsPart.join(', ')}) `;
        }
        if (this.valuesPart instanceof Query) {
            sql += this.valuesPart.generateSql();
        } else {
            sql += `VALUES ${this.valuesPart.map((values) => {
                const preparedValues = Object.values(values).map(v => this.encodeValue(v));
                return `(${preparedValues.join(', ')})`;
            }).join(', ')}`;
        }
        return sql;
    }

    private encodeValue(value: unknown): string | number {
        switch (typeof value) {
            case 'string':
                const normalizedValue = value.replace(/'/g, '\\\'')
                return `'${normalizedValue}'`;
            case 'number':
                return value;
            case 'boolean':
                return value ? 1 : 0;
            case 'object':
                if (value instanceof Date) {
                    return Math.round(value.getTime() / 1000);
                } else if (Array.isArray(value)) {
                    return `[${value.map(v => this.encodeValue(v)).join(', ')}]`;
                } else if (value === null) {
                    return 'NULL';
                } else {
                    throw new Error('Unknown object type');
                }
            default:
                throw new Error(`Unknown value: ${value}`);
        }
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
