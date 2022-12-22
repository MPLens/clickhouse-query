import {describe, expect, it} from '@jest/globals';
import {FilterableQuery} from '../src/FilterableQuery';


describe('FilterableQuery', () => {
    it('keeps numeric values as is in WHERE condition', () => {
        const sql = (new FilterableQuery())
            .where('id', '=', 1)
            .generateWhere();
        expect(sql).toBe('WHERE id = 1');
    });

    it('surrounds string values with quotes in WHERE condition', () => {

        const sql = (new FilterableQuery())
            .where('first_name', '=', 'John')
            .generateWhere();
        expect(sql).toBe(`WHERE first_name = 'John'`);
    });

    it('Build simple select query with WHERE single condition', () => {

        const sql = (new FilterableQuery())

            .where('last_name', '=', 'Alex')
            .generateWhere();

        expect(sql).toBe(`WHERE last_name = 'Alex'`);
    });

    it('Build select query with multiple WHERE conditions', () => {

        const sql = (new FilterableQuery())
            .where('created_date', '=', '2020-01-01')
            .where('first_name', '=', 'John')
            .generateWhere();

        expect(sql).toBe(`WHERE created_date = '2020-01-01' AND first_name = 'John'`);
    });

    it('builds WHERE condition with = sign', () => {

        const sql = (new FilterableQuery())
            .where('id', '=', 1)
            .generateWhere();

        expect(sql).toBe('WHERE id = 1');
    });

    it('builds WHERE condition with >= sign', () => {

        const sql = (new FilterableQuery())
            .where('id', '>=', 1)
            .generateWhere();

        expect(sql).toBe('WHERE id >= 1');
    });

    it('builds WHERE condition with > sign', () => {
        const sql = (new FilterableQuery())
            .where('id', '>', 1)
            .generateWhere();

        expect(sql).toBe('WHERE id > 1');
    });

    it('builds WHERE condition with < sign', () => {

        const sql = (new FilterableQuery())
            .where('id', '<', 1)
            .generateWhere();

        expect(sql).toBe('WHERE id < 1');
    });

    it('builds WHERE condition with <= sign', () => {

        const sql = (new FilterableQuery())
            .where('id', '<=', 1)
            .generateWhere();

        expect(sql).toBe('WHERE id <= 1');
    });

    it('builds WHERE condition with BETWEEN string type', () => {

        const sql = (new FilterableQuery())
            .where('created_date', 'BETWEEN', ['2020-01-01', '2020-01-02'])
            .generateWhere();

        expect(sql).toBe(`WHERE created_date BETWEEN '2020-01-01' AND '2020-01-02'`);
    });

    it('builds WHERE condition with BETWEEN numeric type', () => {

        const sql = (new FilterableQuery())
            .where('created_date', 'BETWEEN', [1, 100])
            .generateWhere();

        expect(sql).toBe(`WHERE created_date BETWEEN 1 AND 100`);
    });

    it('builds WHERE condition with IN type', () => {

        const sql = (new FilterableQuery())
            .where('id', 'IN', [1, 2, 3])
            .generateWhere();

        expect(sql).toBe(`WHERE id IN (1, 2, 3)`);
    });

    it('builds WHERE condition with NOT IN type', () => {

        const sql = (new FilterableQuery())
            .where('id', 'NOT IN', [1, 2, 3])
            .generateWhere();

        expect(sql).toBe(`WHERE id NOT IN (1, 2, 3)`);
    });

    it('builds WHERE condition with LIKE type post search', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'LIKE', 'John%')
            .generateWhere();

        expect(sql).toBe(`WHERE first_name LIKE 'John%'`);
    });

    it('builds WHERE condition with LIKE type substring search', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'LIKE', '%John%')
            .generateWhere();

        expect(sql).toBe(`WHERE first_name LIKE '%John%'`);
    });


    it('builds WHERE condition with NOT LIKE type post search', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'NOT LIKE', 'John%')
            .generateWhere();

        expect(sql).toBe(`WHERE first_name NOT LIKE 'John%'`);
    });

    it('builds WHERE condition with NOT LIKE type substring search', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'NOT LIKE', '%John%')
            .generateWhere();

        expect(sql).toBe(`WHERE first_name NOT LIKE '%John%'`);
    });

    it('builds grouped WHERE (OR) condition with ungrouped where first', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'LIKE', 'John%')
            .andWhereGroup('OR', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .generateWhere();

        expect(sql).toBe(`WHERE first_name LIKE 'John%' AND (email = 'john.doe@example.com' OR last_name = 'Doe')`);
    });

    it('builds grouped WHERE (OR) condition with ungrouped where last', () => {

        const sql = (new FilterableQuery())
            .orWhereGroup('AND', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .andWhere('first_name', 'LIKE', 'John%')
            .generateWhere();

        expect(sql).toBe(`WHERE (email = 'john.doe@example.com' AND last_name = 'Doe') AND first_name LIKE 'John%'`);
    });

    it('builds grouped WHERE (AND) condition with ungrouped where first', () => {

        const sql = (new FilterableQuery())
            .where('first_name', 'LIKE', 'John%')
            .andWhereGroup('AND', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .generateWhere();

        expect(sql).toBe(`WHERE first_name LIKE 'John%' AND (email = 'john.doe@example.com' AND last_name = 'Doe')`);
    });

    it('builds grouped WHERE (AND) condition with ungrouped where last', () => {

        const sql = (new FilterableQuery())
            .andWhereGroup('AND', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .where('first_name', 'LIKE', 'John%')
            .generateWhere();

        expect(sql).toBe(`WHERE (email = 'john.doe@example.com' AND last_name = 'Doe') AND first_name LIKE 'John%'`);
    });

    it('builds multiple grouped WHERE (OR) conditions', () => {

        const sql = (new FilterableQuery())
            .orWhereGroup('AND', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .orWhereGroup('AND', [
                ['email', '=', 'alex.test@example.com'],
                ['last_name', '=', 'Test'],
            ])
            .generateWhere();

        expect(sql).toBe(`WHERE (email = 'john.doe@example.com' AND last_name = 'Doe') OR (email = 'alex.test@example.com' AND last_name = 'Test')`);
    });

    it('builds multiple grouped WHERE (OR) conditions with regular AND', () => {

        const sql = (new FilterableQuery())


            .orWhereGroup('AND', [
                ['email', '=', 'john.doe@example.com'],
                ['last_name', '=', 'Doe'],
            ])
            .orWhereGroup('AND', [
                ['email', '=', 'alex.test@example.com'],
                ['last_name', '=', 'Test'],
            ])
            .andWhere('username', 'LIKE', 'john%')
            .generateWhere();

        expect(sql).toBe(`WHERE (email = 'john.doe@example.com' AND last_name = 'Doe') OR (email = 'alex.test@example.com' AND last_name = 'Test') AND username LIKE 'john%'`);
    });
});
