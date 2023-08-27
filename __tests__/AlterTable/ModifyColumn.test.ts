import {describe, expect, it} from '@jest/globals';
import {ModifyColumn} from '../../src/AlterTable/ModifyColumn';
import {schema} from '../../src';

describe('ModifyColumn', () => {
    it('throws an error if no name is specified', () => {
        expect(() => (new ModifyColumn()).generateSql()).toThrow('No name specified to modify');
    });

    it('throws an error if no type is specified', () => {
        expect(() => {
            (new ModifyColumn())
                .name('column1')
                .generateSql();
        }).toThrow('No type specified to modify');
    });

    it('throws an error if no action is specified', () => {
        expect(() => {
            (new ModifyColumn())
                .name('column1')
                .type(schema.string())
                .generateSql();
        }).toThrow('No action specified. Use alter() or modify().');
    });

    describe('MODIFY', () => {
        it('builds with IF EXISTS', () => {
            const sql = (new ModifyColumn())
                .ifExists()
                .modify()
                .name('column3')
                .type(schema.string())
                .generateSql();
            expect(sql).toEqual('MODIFY COLUMN IF EXISTS column3 String');
        });

        it('builds without IF EXISTS', () => {
            const sql = (new ModifyColumn())
                .modify()
                .name('column3')
                .type(schema.string())
                .generateSql();
            expect(sql).toEqual('MODIFY COLUMN column3 String');
        });

        it('builds with AFTER', () => {
            const sql = (new ModifyColumn())
                .modify()
                .name('column3')
                .type(schema.string())
                .after('column2')
                .generateSql();
            expect(sql).toEqual('MODIFY COLUMN column3 String AFTER column2');
        });

        it('builds with FIRST', () => {
            const sql = (new ModifyColumn())
                .modify()
                .name('column3')
                .type(schema.string())
                .first()
                .generateSql();
            expect(sql).toEqual('MODIFY COLUMN column3 String FIRST');
        });
    });

    describe('ALTER', () => {
        it('builds with IF EXISTS', () => {
            const sql = (new ModifyColumn())
                .ifExists()
                .alter()
                .name('column3')
                .type(schema.string())
                .after('column2')
                .generateSql();
            expect(sql).toEqual('ALTER COLUMN IF EXISTS column3 TYPE String AFTER column2');
        });

        it('builds without IF EXISTS', () => {
            const sql = (new ModifyColumn())
                .alter()
                .name('column3')
                .type(schema.string())
                .after('column2')
                .generateSql();
            expect(sql).toEqual('ALTER COLUMN column3 TYPE String AFTER column2');
        });

        it('builds with AFTER', () => {
            const sql = (new ModifyColumn())
                .alter()
                .name('column3')
                .type(schema.string())
                .after('column2')
                .generateSql();
            expect(sql).toEqual('ALTER COLUMN column3 TYPE String AFTER column2');
        });

        it('builds with FIRST', () => {
            const sql = (new ModifyColumn())
                .alter()
                .name('column3')
                .type(schema.string())
                .first()
                .generateSql();
            expect(sql).toEqual('ALTER COLUMN column3 TYPE String FIRST');
        });
    });
});
