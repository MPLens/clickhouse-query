import {describe, expect, it} from '@jest/globals';
import {ClearColumn} from '../../src/AlterTable/ClearColumn';

describe('ClearColumn', () => {
    it('throws an error if no name is specified', () => {
        expect(() => {
            (new ClearColumn()).generateSql();
        }).toThrowError('No old name specified to rename');
    });

    it('throws an error if no partition is specified', () => {
        expect(() => {
            (new ClearColumn()).name('column').generateSql();
        }).toThrowError('No partition specified to clear');
    });

    it('builds with IF EXISTS', () => {
        const sql = (new ClearColumn())
            .ifExists()
            .name('column')
            .inPartition('partition_name')
            .generateSql();
        expect(sql).toEqual('CLEAR COLUMN IF EXISTS column IN PARTITION partition_name');
    });

    it('builds without IF EXISTS', () => {
        const sql = (new ClearColumn())
            .name('column')
            .inPartition('partition_name')
            .generateSql();
        expect(sql).toEqual('CLEAR COLUMN column IN PARTITION partition_name');
    });
});
