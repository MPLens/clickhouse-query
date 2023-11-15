import {describe, expect, it} from '@jest/globals';
import {createClient} from '@clickhouse/client'
import winston from 'winston';
import {UpdateQuery} from '../src/internal';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('@clickhouse/client');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getUpdateQuery(): UpdateQuery {
    return new UpdateQuery(createClient(), createLogger());
}

describe('UpdateQuery', () => {

    it('updates single column', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('ip', '127.0.0.1')
            .where('ip', '=', '127.0.0.0')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE ip = '127.0.0.1' WHERE ip = '127.0.0.0'`);
    });

    it('updates multiple columns chained', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('ip', '127.0.0.1')
            .value('user_agent', 'Googlebot/2.1')
            .where('ip', '=', '127.0.0.0')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE ip = '127.0.0.1', user_agent = 'Googlebot/2.1' WHERE ip = '127.0.0.0'`);
    });

    it('updates multiple columns as batch', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .values([
                ['ip', '127.0.0.1'],
                ['user_agent', 'Googlebot/2.1'],
            ])
            .where('ip', '=', '127.0.0.0')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE ip = '127.0.0.1', user_agent = 'Googlebot/2.1' WHERE ip = '127.0.0.0'`);
    });

    it('wraps string with quotes properly', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('ip', '127.0.0.1')
            .where('ip', '=', '127.0.0.0')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE ip = '127.0.0.1' WHERE ip = '127.0.0.0'`);
    });

    it('treats number value as literal', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('batch_id', 1000)
            .where('batch_class', '=', 'test-1')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE batch_id = 1000 WHERE batch_class = 'test-1'`);
    });

    it('converts Date object as value properly', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('created_date', new Date(2020, 1, 1))
            .where('id', '=', 1)
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE created_date = 1580511600 WHERE id = 1`);
    });

    it('converts array as value properly', () => {
        const insertQuery = getUpdateQuery();
        const sql = insertQuery
            .table('metrics')
            .value('ips', ['127.0.0.1', '127.0.0.2'])
            .where('id', '=', 1)
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics UPDATE ips = ['127.0.0.1', '127.0.0.2'] WHERE id = 1`);
    });
});
