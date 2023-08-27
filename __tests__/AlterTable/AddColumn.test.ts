import {describe, expect, it} from '@jest/globals';
import {AddColumn} from '../../src/AlterTable/AddColumn';
import {schema} from '../../src';

describe('AddColumn', () => {
    it('throws error if no name specified', () => {
        expect(() => {
            (new AddColumn()).generateSql();
        }).toThrowError('No name specified to add');
    });

    it('throws error if no type specified', () => {
        expect(() => {
            (new AddColumn()).name('test').generateSql();
        }).toThrowError('No type specified to add');
    });

    it('builds with IF NOT EXISTS', () => {
        const sql = (new AddColumn())
            .ifNotExists()
            .name('test')
            .type(schema.string())
            .generateSql();
        expect(sql).toEqual('ADD COLUMN IF NOT EXISTS test String');
    });

    it('builds without IF NOT EXISTS', () => {
        const sql = (new AddColumn())
            .name('test')
            .type(schema.string())
            .generateSql();
        expect(sql).toEqual('ADD COLUMN test String');
    });

    it('builds with AFTER column', () => {
        const sql = (new AddColumn())
            .ifNotExists()
            .name('column2')
            .type(schema.string())
            .after('column')
            .generateSql();
        expect(sql).toEqual('ADD COLUMN IF NOT EXISTS column2 String AFTER column');
    });

    it('builds with FIRST', () => {
        const sql = (new AddColumn())
            .ifNotExists()
            .name('column2')
            .type(schema.string())
            .first()
            .generateSql();
        expect(sql).toEqual('ADD COLUMN IF NOT EXISTS column2 String FIRST');
    });
});
