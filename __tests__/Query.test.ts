import {describe, expect, it} from '@jest/globals';
import {ClickHouse} from 'clickhouse';
import winston from 'winston';
import {fx, expr} from '../src';
import {Query} from '../src/Query';

// @ts-ignore
jest.mock('winston');

// @ts-ignore
jest.mock('clickhouse');

function createLogger() {
    return winston.createLogger({
        level: 'info',
    });
}

function getQuery(): Query {
    return new Query(new ClickHouse({}), createLogger());
}

describe('Query', () => {

    it('wraps whole SQL with alias', () => {
        const query = getQuery();
        const sql = query
            .select(['id'])
            .from('users')
            .as('p')
            .generateSql();

        expect(sql).toBe('(SELECT id FROM users) AS p');
    });

    describe('Query helper functions', () => {
        it('generates anyLast(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.anyLast(expr('created_date'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT anyLast(created_date) FROM users');
        });

        it('generates anyLast(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.anyLast('created_date')]).from('users').generateSql();
            expect(sql).toEqual('SELECT anyLast(created_date) FROM users');
        });

        it('generates anyLast(X) with position as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.anyLastPos(expr('created_date'), 1)]).from('users').generateSql();
            expect(sql).toEqual('SELECT anyLast(created_date)[1] FROM users');
        });

        it('generates anyLast(X) with position expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.anyLastPos('created_date', 1)]).from('users').generateSql();
            expect(sql).toEqual('SELECT anyLast(created_date)[1] FROM users');
        });

        it('generates avg(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.avg(expr('rating'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT avg(rating) FROM users');
        });

        it('generates avg(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.avg('rating')]).from('users').generateSql();
            expect(sql).toEqual('SELECT avg(rating) FROM users');
        });

        it('generates avgIf(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.avgIf(expr('rating'), 'rating > 0')]).from('users').generateSql();
            expect(sql).toEqual('SELECT avgIf(rating, rating > 0) FROM users');
        });

        it('generates avgIf(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.avgIf('rating', 'rating > 0')]).from('users').generateSql();
            expect(sql).toEqual('SELECT avgIf(rating, rating > 0) FROM users');
        });

        it('generates min(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.min(expr('amount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT min(amount) FROM users');
        });

        it('generates min(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.min('amount')]).from('users').generateSql();
            expect(sql).toEqual('SELECT min(amount) FROM users');
        });

        it('generates max(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.max(expr('amount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT max(amount) FROM users');
        });

        it('generates max(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.max('amount')]).from('users').generateSql();
            expect(sql).toEqual('SELECT max(amount) FROM users');
        });

        it('generates sum(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.sum(expr('amount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT sum(amount) FROM users');
        });

        it('generates sum(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.sum('amount')]).from('users').generateSql();
            expect(sql).toEqual('SELECT sum(amount) FROM users');
        });

        it('generates count(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.count(expr('id'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT count(id) FROM users');
        });

        it('generates count(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.count('id')]).from('users').generateSql();
            expect(sql).toEqual('SELECT count(id) FROM users');
        });

        it('generates count(DISTINCT X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.countDistinct(expr('created_date'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT count(DISTINCT created_date) FROM users');
        });

        it('generates count(DISTINCT X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.countDistinct('created_date')]).from('users').generateSql();
            expect(sql).toEqual('SELECT count(DISTINCT created_date) FROM users');
        });

        it('generates count(DISTINCT X) as array', () => {
            const q = getQuery();
            const sql = q.select([fx.countDistinct(['created_date', 'email'])]).from('users').generateSql();
            expect(sql).toEqual('SELECT count(DISTINCT created_date, email) FROM users');
        });

        it('generates countIf() as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.countIf(expr('amount_diff < 0'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT countIf(amount_diff < 0) FROM users');
        });

        it('generates countIf() expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.countIf('amount_diff < 0')]).from('users').generateSql();
            expect(sql).toEqual('SELECT countIf(amount_diff < 0) FROM users');
        });

        it('generates abs() as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.abs(expr('amount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT abs(amount) FROM users');
        });

        it('generates abs() expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.abs('amount')]).from('users').generateSql();
            expect(sql).toEqual('SELECT abs(amount) FROM users');
        });

        it('generates if() true condition = scalar, false condition = scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.if(expr('amount > 0'), 50, 100)]).from('users').generateSql();
            expect(sql).toEqual('SELECT if(amount > 0, 50, 100) FROM users');
        });

        it('generates if() true condition = expression, false condition = scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.if(expr('amount > 0'), expr('amount'), 0)]).from('users').generateSql();
            expect(sql).toEqual('SELECT if(amount > 0, amount, 0) FROM users');
        });

        it('generates if() true condition = scalar, false condition = expression', () => {
            const q = getQuery();
            const sql = q.select([fx.if(expr('amount > 0'), 0, expr('amount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT if(amount > 0, 0, amount) FROM users');
        });

        it('generates if() true condition = expression, false condition = expression', () => {
            const q = getQuery();
            const sql = q.select([fx.if(expr('amount > 0'), expr('price'), expr('price_discount'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT if(amount > 0, price, price_discount) FROM users');
        });

        it('generates round(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.round(expr('price'), 2)]).from('users').generateSql();
            expect(sql).toEqual('SELECT round(price, 2) FROM users');
        });

        it('generates round(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.round('price', 2)]).from('users').generateSql();
            expect(sql).toEqual('SELECT round(price, 2) FROM users');
        });

        it('generates groupArray(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.groupArray(expr('created_date'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT groupArray(created_date) FROM users');
        });

        it('generates groupArray(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.groupArray('created_date')]).from('users').generateSql();
            expect(sql).toEqual('SELECT groupArray(created_date) FROM users');
        });

        it('generates arrayJoin(X) as expression', () => {
            const q = getQuery();
            const sql = q.select([fx.arrayJoin('created_date')]).from('users').generateSql();
            expect(sql).toEqual('SELECT arrayJoin(created_date) FROM users');
        });

        it('generates arrayJoin(X) expression as scalar', () => {
            const q = getQuery();
            const sql = q.select([fx.arrayJoin(expr('created_date'))]).from('users').generateSql();
            expect(sql).toEqual('SELECT arrayJoin(created_date) FROM users');
        });

        it('generates subtractDays()', () => {
            const q = getQuery();
            const sql = q.select([fx.subtractDays('now()', 10)]).from('users').generateSql();
            expect(sql).toEqual('SELECT subtractDays(now(), 10) FROM users');
        });

        it('generates subtractDays() as param', () => {
            const q = getQuery();
            const sql = q.select([fx.subtractDays('now()', '{param:UInt32}')]).from('users').generateSql();
            expect(sql).toEqual('SELECT subtractDays(now(), {param:UInt32}) FROM users');
        });

        it('generates argMin() as param', () => {
            const q = getQuery();
            const sql = q.select([fx.argMin('user', 'salary')]).from('salary').generateSql();
            expect(sql).toEqual('SELECT argMin(user, salary) FROM salary');
        });

        it('generates argMax() as param', () => {
            const q = getQuery();
            const sql = q.select([fx.argMax('user', 'salary')]).from('salary').generateSql();
            expect(sql).toEqual('SELECT argMax(user, salary) FROM salary');
        });

        it('generates indexOf() with string as haystack (expression)', () => {
            const q = getQuery();
            const sql = q.select([fx.indexOf(expr('first_name'), '{name:String}')]).from('users').generateSql();
            expect(sql).toEqual(`SELECT indexOf(first_name, {name:String}) FROM users`);
        });

        it('generates indexOf() with string as haystack (scalar)', () => {
            const q = getQuery();
            const sql = q.select([fx.indexOf('first_name', '{name:String}')]).from('users').generateSql();
            expect(sql).toEqual(`SELECT indexOf(first_name, {name:String}) FROM users`);
        });

        it('generates indexOf() with number as haystack', () => {
            const q = getQuery();
            const sql = q.select([fx.indexOf(expr('first_name'), 1)]).from('users').generateSql();
            expect(sql).toEqual(`SELECT indexOf(first_name, 1) FROM users`);
        });

        it('generates indexOf() with number as haystack (scalar)', () => {
            const q = getQuery();
            const sql = q.select([fx.indexOf('first_name', 1)]).from('users').generateSql();
            expect(sql).toEqual(`SELECT indexOf(first_name, 1) FROM users`);
        });

        it('generates empty()', () => {
            const q = getQuery();
            const sql = q.select([
                fx.empty(
                    fx.groupArray('price')
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT empty(groupArray(price)) FROM users`);
        });

        it('generates positionCaseInsensitive() as haystack (expression)', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    fx.translateUTF8(
                        expr('first_name'),
                        'ÁáČ',
                        'AaC'
                    ),
                    '{name:String}',
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(translateUTF8(first_name, 'ÁáČ', 'AaC'), {name:String}) FROM users`);
        });

        it('generates positionCaseInsensitive() as haystack (scalar)', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    fx.translateUTF8(
                        'first_name',
                        'ÁáČ',
                        'AaC'
                    ),
                    '{name:String}',
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(translateUTF8(first_name, 'ÁáČ', 'AaC'), {name:String}) FROM users`);
        });

        it('generates positionCaseInsensitive() with nested expression', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    expr('first_name'),
                    fx.translateUTF8(
                        expr('first_name'),
                        'ÁáČ',
                        'AaC'
                    ),
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(first_name, translateUTF8(first_name, 'ÁáČ', 'AaC')) FROM users`);
        });

        it('generates positionCaseInsensitive() as needle (scalar)', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    expr('first_name'),
                    fx.translateUTF8(
                        expr('first_name'),
                        'ÁáČ',
                        'AaC'
                    ),
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(first_name, translateUTF8(first_name, 'ÁáČ', 'AaC')) FROM users`);
        });

        it('generates positionCaseInsensitive() with param as needle', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    expr('first_name'),
                    '{name:String}'
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(first_name, {name:String}) FROM users`);
        });

        it('generates positionCaseInsensitive() with number as needle', () => {
            const q = getQuery();
            const sql = q.select([
                fx.positionCaseInsensitive(
                    expr('first_name'),
                    1
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT positionCaseInsensitive(first_name, 1) FROM users`);
        });

        it('generates translateUTF8() as expressions', () => {
            const q = getQuery();
            const sql = q.select([
                fx.translateUTF8(
                    expr('first_name'),
                    'ÁáČ',
                    'AaC'
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT translateUTF8(first_name, 'ÁáČ', 'AaC') FROM users`);
        });

        it('generates translateUTF8() as scalar', () => {
            const q = getQuery();
            const sql = q.select([
                fx.translateUTF8(
                    'first_name',
                    'ÁáČ',
                    'AaC'
                )
            ])
                .from('users')
                .generateSql();
            expect(sql).toEqual(`SELECT translateUTF8(first_name, 'ÁáČ', 'AaC') FROM users`);
        });
    });

    describe('WITH', () => {
        it('simple with', () => {
            const q = getQuery();
            const sql = q
                .with([
                    expr("toStartOfDay(toDate('2021-01-01'))").as('start'),
                    expr("toStartOfDay(toDate('2021-01-02'))").as('end'),
                ])
                .select([
                    fx.arrayJoin(
                        expr('arrayMap(x -> toDateTime(x), range(toUInt32(start), toUInt32(end), 3600))')
                    )
                ])
                .generateSql();
            expect(sql).toBe(`WITH toStartOfDay(toDate('2021-01-01')) AS start, toStartOfDay(toDate('2021-01-02')) AS end SELECT arrayJoin(arrayMap(x -> toDateTime(x), range(toUInt32(start), toUInt32(end), 3600)))`);
        });

        it('Using constant expression as “variable”', () => {
            const q = getQuery();
            const sql = q
                .with('2019-08-01 15:23:00', 'ts_upper_bound')
                .select('*')
                .from('hits')
                .where('EventDate', '=', expr('toDate(ts_upper_bound)'))
                .andWhere('EventTime', '<', expr('ts_upper_bound'))
                .generateSql();
            expect(sql).toBe(`WITH '2019-08-01 15:23:00' AS ts_upper_bound SELECT * FROM hits WHERE EventDate = toDate(ts_upper_bound) AND EventTime < ts_upper_bound`);
        });

        it('Evicting an expression result from the SELECT clause column list', () => {
            const q = getQuery();
            const sql = q
                .with([fx.sum(expr('bytes')).as('s')])
                .select([expr('formatReadableSize(s)'), expr('table')])
                .from('system.parts')
                .groupBy(['table'])
                .orderBy([['s', 'ASC']])
                .generateSql();
            expect(sql).toBe(`WITH sum(bytes) AS s SELECT formatReadableSize(s), table FROM system.parts GROUP BY table ORDER BY s ASC`);
        });

        it('Using results of a scalar subquery', () => {
            const q = getQuery();
            const q2 = getQuery();
            const sql = q
                .with([
                    q2.select([fx.sum(expr('bytes'))])
                        .from('system.parts')
                        .where('active', '=', 1)
                        .as('total_disk_usage')
                ])
                .select([expr('(sum(bytes) / total_disk_usage) * 100 AS table_disk_usage'), expr('table')])
                .from('system.parts')
                .groupBy(['table'])
                .orderBy([['table_disk_usage', 'DESC']])
                .limit(10)
                .generateSql();
            expect(sql).toBe(`WITH (SELECT sum(bytes) FROM system.parts WHERE active = 1) AS total_disk_usage SELECT (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage, table FROM system.parts GROUP BY table ORDER BY table_disk_usage DESC LIMIT 10`);
        });

        it('Reusing expression in a subquery', () => {
            const sql = getQuery()
                .with([
                    getQuery()
                        .select([expr('i + 1'), expr('j + 1')])
                        .from('test1')
                        .as('test1', 'first')
                ])
                .select('*')
                .from('test1')
                .generateSql();
            expect(sql).toBe(`WITH test1 AS (SELECT i + 1, j + 1 FROM test1) SELECT * FROM test1`);
        });

        it('Using WITH within WITH as query', () => {
            const q = getQuery();
            const q2 = getQuery();
            const sql = q
                .with(
                    q2
                        .with([expr('2022-12-11').as('some_date')])
                        .select([fx.sum(expr('bytes'))])
                        .from('system.parts')
                        .where('active', '=', 1),
                    'alias'
                )
                .select([expr('(sum(bytes) / total_disk_usage) * 100 AS table_disk_usage'), expr('table')])
                .from('system.parts')
                .groupBy(['table'])
                .orderBy([['table_disk_usage', 'DESC']])
                .limit(10)
                .generateSql();
            expect(sql).toBe(`WITH (WITH 2022-12-11 AS some_date SELECT sum(bytes) FROM system.parts WHERE active = 1) AS alias SELECT (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage, table FROM system.parts GROUP BY table ORDER BY table_disk_usage DESC LIMIT 10`);
        });

        it('Using WITH within WITH as list of params', () => {
            const q = getQuery();
            const q2 = getQuery();
            const sql = q
                .with(
                    [
                        q2
                            .with([expr('2022-12-11').as('some_date')])
                            .select([fx.sum(expr('bytes'))])
                            .from('system.parts')
                            .where('active', '=', 1)
                    ],
                    'alias'
                )
                .select([expr('(sum(bytes) / total_disk_usage) * 100 AS table_disk_usage'), expr('table')])
                .from('system.parts')
                .groupBy(['table'])
                .orderBy([['table_disk_usage', 'DESC']])
                .limit(10)
                .generateSql();
            expect(sql).toBe(`WITH (WITH 2022-12-11 AS some_date SELECT sum(bytes) FROM system.parts WHERE active = 1) AS alias SELECT (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage, table FROM system.parts GROUP BY table ORDER BY table_disk_usage DESC LIMIT 10`);
        });
    });

    describe('SELECT', () => {
        it('selects all by default', () => {
            const query = getQuery();
            const sql = query.from('users').generateSql();
            expect(sql).toBe('SELECT * FROM users');
        });

        it('selects one column', () => {
            const query = getQuery();
            const sql = query.select('id').from('users').generateSql();
            expect(sql).toBe('SELECT id FROM users');
        });

        it('selects multiple columns', () => {
            const query = getQuery();
            const sql = query.select(['id', 'first_name', 'last_name']).from('users').generateSql();
            expect(sql).toBe('SELECT id, first_name, last_name FROM users');
        });

        it('can process subquery', () => {
            const query = getQuery();
            const sql = query
                .select([
                    'ip',
                    getQuery()
                        .select('created_date')
                        .from('user_visits')
                        .select('created_date')
                        .where('user_id', '=', 1)
                        .orderBy([['created_date', 'ASC']])
                        .limit(1)
                        .offset(0)
                        .as('first_visit_date'),
                ])
                .from('users')
                .where('user_id', '=', 1)
                .generateSql();

            expect(sql).toBe('SELECT ip, (SELECT created_date FROM user_visits WHERE user_id = 1 ORDER BY created_date ASC OFFSET 0 ROW FETCH FIRST 1 ROWS ONLY) AS first_visit_date FROM users WHERE user_id = 1');
        });

        it('can use multiple helper functions', () => {
            const query = getQuery();
            const sql = query
                .select([
                    fx.anyLast('price').as('price'),
                    fx.anyLastPos('created_date', 1).as('created_date'),
                    fx.abs('negative_number').as('positive_number'),
                ])
                .from('users')
                .generateSql();

            expect(sql).toBe('SELECT anyLast(price) AS price, anyLast(created_date)[1] AS created_date, abs(negative_number) AS positive_number FROM users');
        });

        it('can use nested helper functions', () => {
            const query = getQuery();
            const sql = query
                .select([
                    fx.round(fx.anyLast('price'), 2).as('price'),
                ])
                .from('users')
                .generateSql();

            expect(sql).toBe('SELECT round(anyLast(price), 2) AS price FROM users');
        });
    })

    describe('FROM', () => {
        it('works without table alias', () => {
            const query = getQuery();
            const sql = query.from('users', 'p').generateSql();
            expect(sql).toBe('SELECT * FROM users p');
        });

        it('adds alias to table', () => {
            const query = getQuery();
            const sql = query.from('users').generateSql();
            expect(sql).toBe('SELECT * FROM users');
        });

        it('supports subquery', () => {
            const q = getQuery();
            const sql = q
                .select(['id', 'email'])
                .from(
                    getQuery()
                        .select(['id', 'email'])
                        .from('users')
                        .where('status', '>', 10)
                ).generateSql();
            expect(sql).toBe('SELECT id, email FROM (SELECT id, email FROM users WHERE status > 10)');
        });

        it('supports subquery with alias', () => {
            const q = getQuery();
            const sql = q
                .select(['id', 'email'])
                .from(
                    getQuery()
                        .select(['id', 'email'])
                        .from('users')
                        .where('status', '>', 10),
                    'u'
                ).generateSql();
            expect(sql).toBe('SELECT id, email FROM (SELECT id, email FROM users WHERE status > 10) AS u');
        });
    });

    describe('HAVING', () => {

        it('adds HAVING to query with single condition', () => {
            const query = getQuery();
            const sql = query
                .select([
                    'repo_name',
                    fx.sum(expr("event_type = 'ForkEvent'")).as('forks'),
                    fx.sum(expr("event_type = 'WatchEvent'")).as('stars'),
                    fx.round(expr('stars / forks'), 2).as('ratio'),
                ])
                .from('github_events')
                .where('event_type', 'IN', ['ForkEvent', 'WatchEvent'])
                .groupBy(['repo_name'])
                .orderBy([['ratio', 'DESC']])
                .having('stars', '>', 100)
                .limit(50)
                .generateSql();
            expect(sql).toBe('SELECT repo_name, sum(event_type = \'ForkEvent\') AS forks, sum(event_type = \'WatchEvent\') AS stars, round(stars / forks, 2) AS ratio FROM github_events WHERE event_type IN (\'ForkEvent\', \'WatchEvent\') GROUP BY repo_name HAVING stars > 100 ORDER BY ratio DESC LIMIT 50');
        });

        it('adds HAVING to query with or condition', () => {
            const query = getQuery();
            const sql = query
                .select([
                    'repo_name',
                    fx.sum(expr("event_type = 'ForkEvent'")).as('forks'),
                    fx.sum(expr("event_type = 'WatchEvent'")).as('stars'),
                    fx.round(expr('stars / forks'), 2).as('ratio'),
                ])
                .from('github_events')
                .where('event_type', 'IN', ['ForkEvent', 'WatchEvent'])
                .groupBy(['repo_name'])
                .orderBy([['ratio', 'DESC']])
                .having('stars', '>', 100)
                .orHaving('forks', '>', 100)
                .limit(50)
                .generateSql();
            expect(sql).toBe('SELECT repo_name, sum(event_type = \'ForkEvent\') AS forks, sum(event_type = \'WatchEvent\') AS stars, round(stars / forks, 2) AS ratio FROM github_events WHERE event_type IN (\'ForkEvent\', \'WatchEvent\') GROUP BY repo_name HAVING stars > 100 OR forks > 100 ORDER BY ratio DESC LIMIT 50');
        });

        it('adds HAVING to query with and condition', () => {
            const query = getQuery();
            const sql = query
                .select([
                    'repo_name',
                    fx.sum(expr("event_type = 'ForkEvent'")).as('forks'),
                    fx.sum(expr("event_type = 'WatchEvent'")).as('stars'),
                    fx.round(expr('stars / forks'), 2).as('ratio'),
                ])
                .from('github_events')
                .where('event_type', 'IN', ['ForkEvent', 'WatchEvent'])
                .groupBy(['repo_name'])
                .orderBy([['ratio', 'DESC']])
                .having('stars', '>', 100)
                .andHaving('forks', '>', 100)
                .limit(50)
                .generateSql();
            expect(sql).toBe('SELECT repo_name, sum(event_type = \'ForkEvent\') AS forks, sum(event_type = \'WatchEvent\') AS stars, round(stars / forks, 2) AS ratio FROM github_events WHERE event_type IN (\'ForkEvent\', \'WatchEvent\') GROUP BY repo_name HAVING stars > 100 AND forks > 100 ORDER BY ratio DESC LIMIT 50');
        });
    })

    describe('FINAL', () => {
        it('adds FINAL to query', () => {
            const query = getQuery();
            const sql = query
                .select('*')
                .from('metrics')
                .final()
                .generateSql();
            expect(sql).toBe('SELECT * FROM metrics FINAL');
        });

        it('adds FINAL with table alias properly', () => {
            const query = getQuery();
            const sql = query
                .select('*')
                .from('metrics', 'm')
                .final()
                .generateSql();
            expect(sql).toBe('SELECT * FROM metrics m FINAL');
        });
    });

    describe('LIMIT/OFFSET', () => {
        it('builds LIMIT and OFFSET parts', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users')
                .limit(10)
                .offset(0)
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users OFFSET 0 ROW FETCH FIRST 10 ROWS ONLY`);
        });

        it('LIMIT could be used alone', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users')
                .limit(10)
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users LIMIT 10`);
        });
    });

    describe('JOINs', () => {
        it('simple join', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users', 'u')
                .join(
                    'INNER JOIN',
                    getQuery()
                        .select(['user_id'])
                        .from('posts')
                        .where('id', '>', 1),
                    'p',
                    'p.user_id = u.user_id'
                )
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users u INNER JOIN (SELECT user_id FROM posts WHERE id > 1) AS p ON p.user_id = u.user_id`);
        });

        it('simple join on table', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users', 'u')
                .join(
                    'INNER JOIN',
                    'posts',
                    'p',
                    'p.user_id = u.user_id'
                )
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users u INNER JOIN posts p ON p.user_id = u.user_id`);
        });

        it('uses INNER JOIN as default', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users', 'u')
                .join(
                    'JOIN',
                    getQuery()
                        .select(['user_id'])
                        .from('posts')
                        .where('id', '>', 1),
                    'p',
                    'p.user_id = u.user_id'
                )
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users u INNER JOIN (SELECT user_id FROM posts WHERE id > 1) AS p ON p.user_id = u.user_id`);
        });

        it('can have multiple joins', () => {
            const query = getQuery();
            const sql = query
                .select(['id', 'first_name'])
                .from('users', 'u')
                .join(
                    'INNER JOIN',
                    getQuery()
                        .select(['user_id'])
                        .from('posts')
                        .where('id', '>', 1),
                    'p',
                    'p.user_id = u.user_id'
                )
                .join(
                    'INNER JOIN',
                    getQuery()
                        .select(['account_id'])
                        .from('bank_accounts')
                        .where('status', '=', 'active'),
                    'ba',
                    'ba.user_id = u.user_id'
                )
                .generateSql();

            expect(sql).toBe(`SELECT id, first_name FROM users u INNER JOIN (SELECT user_id FROM posts WHERE id > 1) AS p ON p.user_id = u.user_id INNER JOIN (SELECT account_id FROM bank_accounts WHERE status = 'active') AS ba ON ba.user_id = u.user_id`);
        });
    })
});
