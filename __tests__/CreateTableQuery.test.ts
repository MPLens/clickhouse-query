import {describe, expect, it} from '@jest/globals';
import {ClickHouse} from 'clickhouse';
import winston from 'winston';
import {CreateTableQuery} from '../src/CreateTableQuery';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('clickhouse');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getCreateTableQuery(): CreateTableQuery {
    return new CreateTableQuery(new ClickHouse({}), createLogger());
}

describe('CreateTableQuery', () => {
    it('builds basic create table', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('table_name')
            .column('column1', createTable.string())
            .engine('Memory')
            .generateSql();

        expect(sql).toBe(`CREATE TABLE table_name(column1 String) ENGINE = Memory`);
    });

    it('creates table with multiples columns', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('table_name')
            .column('column1', createTable.string())
            .column('column_date', createTable.dateTime())
            .engine('Memory')
            .generateSql();

        expect(sql).toBe(`CREATE TABLE table_name(column1 String, column_date DateTime) ENGINE = Memory`);
    });

    it('creates table with ORDER BY', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('table_name')
            .column('column1', createTable.string())
            .column('column_date', createTable.dateTime())
            .engine('MergeTree()')
            .orderBy(['column1', 'column_date'])
            .generateSql();

        expect(sql).toBe(`CREATE TABLE table_name(column1 String, column_date DateTime) ENGINE = MergeTree() ORDER BY (column1, column_date)`);
    });

    it('creates table IF NOT EXISTS mark', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('table_name')
            .ifNotExists()
            .column('column1', createTable.string())
            .engine('Memory')
            .generateSql();

        expect(sql).toBe(`CREATE TABLE IF NOT EXISTS table_name(column1 String) ENGINE = Memory`);
    });

    it('creates table ON CLUSTER', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('table_name')
            .onCluster('my_cluster')
            .column('column1', createTable.string())
            .engine('Memory')
            .generateSql();

        expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 String) ENGINE = Memory`);
    });


    describe('Helpers', () => {
        it('generates Nullable column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.nullable(createTable.string()))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Nullable(String)) ENGINE = Memory`);
        });

        it('generates Int8 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int8())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int8) ENGINE = Memory`);
        });

        it('generates Int16 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int16())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int16) ENGINE = Memory`);
        });

        it('generates Int32 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int32())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int32) ENGINE = Memory`);
        });

        it('generates Int64 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int64())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int64) ENGINE = Memory`);
        });

        it('generates Int128 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int128())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int128) ENGINE = Memory`);
        });

        it('generates Int256 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.int256())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Int256) ENGINE = Memory`);
        });





        it('generates UInt8 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt8())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt8) ENGINE = Memory`);
        });

        it('generates UInt16 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt16())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt16) ENGINE = Memory`);
        });

        it('generates UInt32 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt32())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt32) ENGINE = Memory`);
        });

        it('generates UInt64 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt64())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt64) ENGINE = Memory`);
        });

        it('generates UInt128 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt128())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt128) ENGINE = Memory`);
        });

        it('generates UInt256 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uInt256())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UInt256) ENGINE = Memory`);
        });

        it('generates Float32 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.float32())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Float32) ENGINE = Memory`);
        });

        it('generates Float64 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.float64())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Float64) ENGINE = Memory`);
        });

        it('generates Decimal(X, X) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.decimal(10, 2))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Decimal(10, 2)) ENGINE = Memory`);
        });

        it('generates Decimal32(X, X) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.decimal32(10, 2))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Decimal32(10, 2)) ENGINE = Memory`);
        });

        it('generates Decimal64(X, X) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.decimal64(10, 2))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Decimal64(10, 2)) ENGINE = Memory`);
        });

        it('generates Decimal128(X, X) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.decimal128(10, 2))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Decimal128(10, 2)) ENGINE = Memory`);
        });

        it('generates Decimal256(X, X) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.decimal256(10, 2))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Decimal256(10, 2)) ENGINE = Memory`);
        });

        it('generates Bool column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.boolean())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Bool) ENGINE = Memory`);
        });

        it('generates String column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.string())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 String) ENGINE = Memory`);
        });

        it('generates FixedString(x) column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.fixedString(5))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 FixedString(5)) ENGINE = Memory`);
        });

        it('generates UUID column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.uuid())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 UUID) ENGINE = Memory`);
        });

        it('generates Date column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.date())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Date) ENGINE = Memory`);
        });

        it('generates Date32 column', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.date32())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Date32) ENGINE = Memory`);
        });

        it('generates DateTime without timezone', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.dateTime())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 DateTime) ENGINE = Memory`);
        });

        it('generates DateTime without timezone', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.dateTime())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 DateTime) ENGINE = Memory`);
        });

        it('generates DateTime with timezone', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.dateTime('Asia/Istanbul'))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 DateTime('Asia/Istanbul')) ENGINE = Memory`);
        });




        it('generates DateTime64 without timezone', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.dateTime64(3))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 DateTime64(3)) ENGINE = Memory`);
        });

        it('generates DateTime64 with timezone', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.dateTime64(3,'Asia/Istanbul'))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 DateTime64(3, 'Asia/Istanbul')) ENGINE = Memory`);
        });


        it('generates Enum with key value', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum({hello: 1, world: 2}))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum('hello' = 1, 'world' = 2)) ENGINE = Memory`);
        });

        it('generates Enum with value only', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum(['hello', 'world']))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum('hello', 'world')) ENGINE = Memory`);
        });

        it('generates Enum8 with key value', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum8({hello: 1, world: 2}))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum8('hello' = 1, 'world' = 2)) ENGINE = Memory`);
        });

        it('generates Enum8 with value only', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum8(['hello', 'world']))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum8('hello', 'world')) ENGINE = Memory`);
        });

        it('generates Enum16 with key value', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum16({hello: 1, world: 2}))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum16('hello' = 1, 'world' = 2)) ENGINE = Memory`);
        });

        it('generates Enum16 with value only', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.enum16(['hello', 'world']))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Enum16('hello', 'world')) ENGINE = Memory`);
        });

        it('generates LowCardinality(x)', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.lowCardinality(createTable.string()))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 LowCardinality(String)) ENGINE = Memory`);
        });

        it('generates Array(x)', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.array(createTable.string()))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Array(String)) ENGINE = Memory`);
        });

        it('generates JSON type', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.json())
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 JSON) ENGINE = Memory`);
        });

        it('generates Tuple type', () => {
            const createTable = getCreateTableQuery();
            const sql = createTable
                .table('table_name')
                .onCluster('my_cluster')
                .column('column1', createTable.tuple([
                    ['s', 'String'],
                    ['i', 'Int64'],
                ]))
                .engine('Memory')
                .generateSql();

            expect(sql).toBe(`CREATE TABLE ON CLUSTER my_cluster table_name(column1 Tuple(s String, i Int64)) ENGINE = Memory`);
        });
    });

    // Examples of create tables from ClickHouse officials documentation

    // https://clickhouse.com/docs/en/getting-started/example-datasets/uk-price-paid
    it('UK Property Price Paid', () => {
        const createTable = getCreateTableQuery();
        const sql = createTable
            .table('uk_price_paid')
            .column('price', createTable.uInt32())
            .column('date', createTable.date())
            .column('postcode1', createTable.lowCardinality(createTable.string()))
            .column('postcode2', createTable.lowCardinality(createTable.string()))
            .column('type', createTable.enum8({
                terraced: 1,
                'semi-detached': 2,
                detached: 3,
                flat: 4,
                other: 0
            }))
            .column('is_new', createTable.uInt8())
            .column('duration', createTable.enum8({
                freehold: 1,
                leasehold: 2,
                unknown: 0
            }))
            .column('addr1', createTable.string())
            .column('addr2', createTable.string())
            .column('street', createTable.lowCardinality(createTable.string()))
            .column('locality', createTable.lowCardinality(createTable.string()))
            .column('town', createTable.lowCardinality(createTable.string()))
            .column('district', createTable.lowCardinality(createTable.string()))
            .column('county', createTable.lowCardinality(createTable.string()))
            .engine('MergeTree')
            .orderBy(['postcode1', 'postcode2', 'addr1', 'addr2'])
            .generateSql();

        expect(sql).toBe(`CREATE TABLE uk_price_paid(price UInt32, date Date, postcode1 LowCardinality(String), postcode2 LowCardinality(String), type Enum8('terraced' = 1,'semi-detached' = 2,'detached' = 3,'flat' = 4,'other' = 0), is_new UInt8, duration Enum8('freehold' = 1,'leasehold' = 2,'unknown' = 0), addr1 String, addr2 String, street LowCardinality(String), locality LowCardinality(String), town LowCardinality(String), district LowCardinality(String), county LowCardinality(String)) ENGINE = MergeTree ORDER BY (postcode1, postcode2, addr1, addr2)`);
    });
});
