import {ClickHouseClient} from '@clickhouse/client';
import {Logger} from 'winston';
import {FilterableQuery} from './FilterableQuery';
import {Expression} from './Expression';
import Stream from 'stream';

export class UpdateQuery extends FilterableQuery {
    private readonly connection: ClickHouseClient<Stream.Readable>;
    private readonly logger: Logger | null;

    private tablePart: string | null = null;

    private valuesPart: Array<[string, unknown]> = [];

    constructor(ch: ClickHouseClient<Stream.Readable>, logger: Logger | null) {
        super();
        this.connection = ch;
        this.logger = logger;
    }

    public table(table: string): UpdateQuery {
        this.tablePart = table;
        return this;
    }

    public values(values: Array<[string, unknown]>): UpdateQuery {
        this.valuesPart.push(...values);
        return this;
    }

    public value(column: string, value: unknown): UpdateQuery {
        this.valuesPart.push([column, value]);
        return this;
    }

    public generateSql(): string {
        if (this.tablePart === null) {
            throw new Error('No table specified to update into');
        }
        if (this.valuesPart.length === 0) {
            throw new Error('No values specified to update');
        }
        if (!this.hasWhereConditions()) {
            throw new Error('No where clause specified');
        }

        let sql = `ALTER TABLE ${this.tablePart} UPDATE`;

        const values = this.valuesPart.map(([column, value]) => {
            if (value instanceof Expression) {
                return `${column} = ${value}`;
            } else {
                return `${column} = ${this.encodeValue(value)}`;
            }
        });
        sql += ` ${values.join(', ')}`;
        sql += ` ${this.generateWhere()}`;
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
}
