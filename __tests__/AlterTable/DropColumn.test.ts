import {describe, expect, it} from '@jest/globals';
import {DropColumn} from '../../src/AlterTable/DropColumn';

describe('DropColumn', () => {
    it('throws an error if no name is specified', () => {
        expect(() => {
            (new DropColumn()).generateSql();
        }).toThrowError('No name specified to drop');
    });

    it('builds with IF EXISTS', () => {
        const sql = (new DropColumn())
            .ifExists()
            .name('test')
            .generateSql();
        expect(sql).toEqual('DROP COLUMN IF EXISTS test');
    });

    it('builds without IF EXISTS', () => {
        const sql = (new DropColumn())
            .name('test')
            .generateSql();
        expect(sql).toEqual('DROP COLUMN test');
    });
});
