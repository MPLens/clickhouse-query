import {describe, expect, it} from '@jest/globals';
import {ClickHouse} from 'clickhouse';
import winston from 'winston';
import {InsertQuery, Query} from '../src/internal';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('clickhouse');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getInsertQuery(): InsertQuery {
    return new InsertQuery(new ClickHouse({}), createLogger());
}

function getQuery(): Query {
    return new Query(new ClickHouse({}), createLogger());
}

describe('InsertQuery', () => {

    it('takes columns from values when not provided', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')`);
    });

    it('generates single row as single object', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'ip', 'created_date'])
            .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')`);
    });

    it('generates multiples rows when chained as single object', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'ip', 'created_date'])
            .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
            .values({id: 2, ip: '127.0.0.2', created_date: '2022-12-21'})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')`);
    });

    it('generates multiple rows as bulk', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'ip', 'created_date'])
            .values([
                {id: 1, ip: '127.0.0.1', created_date: '2022-12-20'},
                {id: 2, ip: '127.0.0.2', created_date: '2022-12-21'}
            ])
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')`);
    });

    it('generates multiple rows as bulk (chained)', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'ip', 'created_date'])
            .values([
                {id: 1, ip: '127.0.0.1', created_date: '2022-12-20'},
                {id: 2, ip: '127.0.0.1', created_date: '2022-12-21'}
            ])
            .values([
                {id: 3, ip: '127.0.0.1', created_date: '2022-12-22'},
                {id: 4, ip: '127.0.0.1', created_date: '2022-12-23'}
            ])
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.1', '2022-12-21'), (3, '127.0.0.1', '2022-12-22'), (4, '127.0.0.1', '2022-12-23')`);
    });

    it('allows to insert from query', () => {
        const insertQuery = getInsertQuery();
        const query = getQuery();
        const sql = insertQuery
            .into('metrics')
            .values(
                query
                    .from('old_metrics')
                    .select(['id', 'ip', 'created_date'])
            )
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics SELECT id, ip, created_date FROM old_metrics`);
    });


    it('handles single dimensional arrays properly', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'ips', 'created_date'])
            .values({id: 1, ips: ['127.0.0.1', '127.0.0.2'], created_date: '2022-12-20'})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, ips, created_date) VALUES (1, ['127.0.0.1', '127.0.0.2'], '2022-12-20')`);
    });

    it('handles multi dimensional arrays properly', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'paths'])
            .values({id: 1, paths: [['/', '/a'], ['/', '/b']]})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, paths) VALUES (1, [['/', '/a'], ['/', '/b']])`);
    });

    it('encodes single quotes', () => {
        const insertQuery = getInsertQuery();
        const sql = insertQuery
            .into('metrics')
            .columns(['id', 'title'])
            .values({id: 1, path: ["He said: 'hello'"]})
            .generateSql();

        expect(sql).toBe(`INSERT INTO metrics (id, title) VALUES (1, ['He said: \\'hello\\''])`);
    });
});
