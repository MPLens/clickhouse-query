import {describe, expect, it} from '@jest/globals';
import {CommentColumn} from '../../src/AlterTable/CommentColumn';

describe('CommentColumn', () => {
    it('throws an error if no column name is specified', () => {
        expect(() => {
            (new CommentColumn()).comment('Tariff name').generateSql();
        }).toThrowError('No column name specified to comment');
    });

    it('throws an error if no comment is specified', () => {
        expect(() => {
            (new CommentColumn()).name('tariff_name').generateSql();
        }).toThrowError('No comment specified for column tariff_name');
    });

    it('builds with IF EXISTS', () => {
        const sql = (new CommentColumn())
            .ifExists()
            .name('tariff_name')
            .comment('Tariff name')
            .generateSql();
        expect(sql).toEqual(`COMMENT COLUMN IF EXISTS tariff_name 'Tariff name'`);
    });

    it('builds without IF EXISTS', () => {
        const sql = (new CommentColumn())
            .name('tariff_name')
            .comment('Tariff name')
            .generateSql();
        expect(sql).toEqual(`COMMENT COLUMN tariff_name 'Tariff name'`);
    });
});
