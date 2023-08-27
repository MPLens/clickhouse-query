import {describe, expect, it} from '@jest/globals';
import {RenameColumn} from '../../src/AlterTable/RenameColumn';

describe('RenameColumn', () => {
    it('throws an error if no old name is specified', () => {
        expect(() => {
            (new RenameColumn()).generateSql();
        }).toThrow('No old name specified to rename');
    });

    it('throws an error if no new name is specified', () => {
        expect(() => {
            (new RenameColumn()).from('old').generateSql();
        }).toThrow('No new name specified to rename');
    });

    it('builds with IF EXISTS', () => {
        const sql = (new RenameColumn())
            .ifExists()
            .from('old')
            .to('new')
            .generateSql();
        expect(sql).toEqual('RENAME COLUMN IF EXISTS old TO new');
    });

    it('builds without IF EXISTS', () => {
        const sql = (new RenameColumn())
            .from('old')
            .to('new')
            .generateSql();
        expect(sql).toEqual('RENAME COLUMN old TO new');
    });
});
