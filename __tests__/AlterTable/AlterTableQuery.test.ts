import {describe, expect, it} from '@jest/globals';
import {AddColumn} from '../../src/AlterTable/AddColumn';
import {schema} from '../../src';
import {AlterTableQuery} from '../../src/AlterTable/AlterTableQuery';
import {createClient} from '@clickhouse/client'
import winston from 'winston';
import {DropColumn} from '../../src/AlterTable/DropColumn';
import {RenameColumn} from '../../src/AlterTable/RenameColumn';
import {ClearColumn} from '../../src/AlterTable/ClearColumn';
import {CommentColumn} from '../../src/AlterTable/CommentColumn';
import {ModifyColumn} from '../../src/AlterTable/ModifyColumn';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('@clickhouse/client');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getAlterTableQuery(): AlterTableQuery {
    return new AlterTableQuery(createClient(), createLogger());
}

describe('AlterTableQuery', () => {
    it('throws an error if no table is specified', () => {
        expect(() => {
            getAlterTableQuery().generateSql();
        }).toThrow('No table specified to alter');
    });

    it('throws an error if no operation specified', () => {
        expect(() => {
            getAlterTableQuery().table('table').generateSql();
        }).toThrow('No alter operation specified, for example addColumn() or dropColumn()');
    });

    it('builds ADD COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .addColumn((new AddColumn()).name('column').type(schema.string()))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table ADD COLUMN column String');
    });

    it('builds ADD COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .addColumn((new AddColumn()).name('column').type(schema.string()))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table ON CLUSTER cluster1 ADD COLUMN column String');
    });

    it('builds DROP COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .dropColumn((new DropColumn()).name('column'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table DROP COLUMN column');
    });

    it('builds DROP COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .dropColumn((new DropColumn()).name('column'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table ON CLUSTER cluster1 DROP COLUMN column');
    });

    it('builds RENAME COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .renameColumn((new RenameColumn()).from('column').to('new_column'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table RENAME COLUMN column TO new_column');
    });

    it('builds RENAME COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .renameColumn((new RenameColumn()).from('column').to('new_column'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table ON CLUSTER cluster1 RENAME COLUMN column TO new_column');
    });

    it('builds CLEAR COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .clearColumn((new ClearColumn()).name('column').inPartition('part1'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table CLEAR COLUMN column IN PARTITION part1');
    });

    it('builds CLEAR COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .clearColumn((new ClearColumn()).name('column').inPartition('part1'))
            .generateSql();
        expect(sql).toEqual('ALTER TABLE table ON CLUSTER cluster1 CLEAR COLUMN column IN PARTITION part1');
    });

    it('builds COMMENT COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .commentColumn((new CommentColumn()).name('column').comment('My comment'))
            .generateSql();
        expect(sql).toEqual(`ALTER TABLE table COMMENT COLUMN column 'My comment'`);
    });

    it('builds COMMENT COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .commentColumn((new CommentColumn()).name('column').comment('My comment'))
            .generateSql();
        expect(sql).toEqual(`ALTER TABLE table ON CLUSTER cluster1 COMMENT COLUMN column 'My comment'`);
    });

    it('builds MODIFY COLUMN', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .modifyColumn((new ModifyColumn()).alter().name('column').type(schema.string()))
            .generateSql();
        expect(sql).toEqual(`ALTER TABLE table ALTER COLUMN column TYPE String`);
    });

    it('builds MODIFY COLUMN with ON CLUSTER', () => {
        const sql = getAlterTableQuery()
            .table('table')
            .onCluster('cluster1')
            .modifyColumn((new ModifyColumn()).alter().name('column').type(schema.string()))
            .generateSql();
        expect(sql).toEqual(`ALTER TABLE table ON CLUSTER cluster1 ALTER COLUMN column TYPE String`);
    });
});
