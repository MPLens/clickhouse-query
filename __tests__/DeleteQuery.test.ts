import {describe, expect, it} from '@jest/globals';
import {createClient} from '@clickhouse/client'
import winston from 'winston';
import {DeleteQuery} from '../src/internal';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('@clickhouse/client');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getDeleteQuery(): DeleteQuery {
    return new DeleteQuery(createClient(), createLogger());
}

describe('DeleteQuery', () => {
    it('Basic delete query', () => {
        const deleteQuery = getDeleteQuery();
        const sql = deleteQuery
            .table('metrics')
            .where('created_date', '>', '2022-12-20')
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics DELETE WHERE created_date > '2022-12-20'`);
    });

    it('deletes everything from table', () => {
        const deleteQuery = getDeleteQuery();
        const sql = deleteQuery
            .table('metrics')
            .all()
            .generateSql();

        expect(sql).toBe(`ALTER TABLE metrics DELETE WHERE 1 = 1`);
    });
});
