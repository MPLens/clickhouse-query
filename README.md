# ClickHouse Query

ClickHouse Query is intuitive query builder to overcome the complexity of [ClickHouse](https://clickhouse.com/) SQL
syntax.

[![npm version](https://img.shields.io/npm/v/clickhouse-query.svg?style=flat-square)](https://www.npmjs.org/package/clickhouse-query)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=clickhouse-query&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=clickhouse-query)
[![npm downloads](https://img.shields.io/npm/dm/clickhouse-query.svg?style=flat-square)](https://npm-stat.com/charts.html?package=clickhouse-query)

## Table of Contents

<!-- toc -->

- [Features](#features)
- [Usage](#usage)
  * [Installation](#installation)
  * [Quick start](#quick-start)
- [CREATE TABLE](#create-table)
- [INSERT](#insert)
- [DELETE](#delete)
- [UPDATE](#update)
- [SELECT](#select)
  * [FINAL](#final)
  * [FROM](#from)
  * [WHERE](#where)
  * [HAVING](#having)
  * [JOIN](#join)
  * [LIMIT/OFFSET](#limitoffset)
  * [WITH](#with)
  * [Helper Functions](#helper-functions)
  * [More examples](#more-examples)
- [Tests](#tests)

<!-- tocstop -->

## Features

- Sub-queries
- Table aliases
- Query aliases
- SELECT
- INSERT
- WITH clause
- JOINs (all types)
- WHERE/grouped WHERE
- GROUP BY
- ORDER BY
- LIMIT
- OFFSET
- HAVING
- Helper functions, e.g. `fx.avg()`, `fx.countIf()`, etc
- Custom SQL expressions with `expr()`

## Usage

### Installation

Using yarn:

```bash
yarn add clickhouse-query
```

Using npm:

```bash
npm install clickhouse-query
```

Once the package is installed, you can import the library as follows:

```ts
import {fx, expr, Query, QueryBuilder} from 'clickhouse-query';
```

### Quick start

```ts
import {ClickHouse} from 'clickhouse';
import winston from 'winston';
import {QueryBuilder} from 'clickhouse-query';

const clickhouse = new ClickHouse({
    url: 'http://localhost',
    port: 8123,
    basicAuth: {username: 'user', password: 'password'},
    format: 'json',
    raw: false,
});
const logger = winston.createLogger(); // not required, you can pass as null
const builder = new QueryBuilder(clickhouse, logger);
const users = await builder.query()
    .select('email')
    .from('users')
    .execute();
// Executes: SELECT email FROM users
```

TypeScript example:

```ts
// ...
const users = await builder.query()
    .select('email')
    .from('users')
    .execute<Array<{ email: string }>>();
// Executes: SELECT email FROM users
```

## CREATE TABLE

Creating tables as simple as this:

```ts
await builder.createTable()
    .table('table_name')
    .column('column1', createTable.string())
    .engine('Memory')
    .execute();
// Executes: CREATE TABLE table_name(column1 String) ENGINE = Memory
```

Also, you can provide multiple columns to create: 

```ts
await builder.createTable()
    .table('table_name')
    .column('column1', createTable.string())
    .column('column_date', createTable.dateTime())
    .engine('Memory')
    .execute();
// Executes: CREATE TABLE table_name(column1 String, column_date DateTime) ENGINE = Memory
```

Create table with `ORDER BY`:

```ts
await builder.createTable()
    .table('table_name')
    .column('column1', createTable.string())
    .column('column_date', createTable.dateTime())
    .engine('MergeTree()')
    .orderBy(['column1', 'column_date'])
    .execute();
// Executes: CREATE TABLE table_name(column1 String, column_date DateTime) ENGINE = MergeTree() ORDER BY (column1, column_date)
```

Create table with `IF NOT EXISTS`:

```ts
await builder.createTable()
    .table('table_name')
    .ifNotExists()
    .column('column1', createTable.string())
    .engine('Memory')
    .execute();
// Executes: CREATE TABLE IF NOT EXISTS table_name(column1 String) ENGINE = Memory
```

## INSERT

Builder has special method called `insert()` to handle INSERT queries. Below you may find a couple of examples.

Insert single row:

```ts
await builder.insert()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')
```

Definition of `columns()` is optional, you can use `values()` without it. `values()` will use the first row to determine
the columns.

```ts
await builder.insert()
    .into('metrics')
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')
```

You can chain multiple rows using `values()`:

```ts
await builder.insert()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .values({id: 2, ip: '127.0.0.2', created_date: '2022-12-21'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')
```

You can write bulk rows (same as above):

```ts
await builder.insert()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values([
        {id: 1, ip: '127.0.0.1', created_date: '2022-12-20'},
        {id: 2, ip: '127.0.0.2', created_date: '2022-12-21'}
    ])
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')
```

## DELETE

Builder has special method called `delete()` to handle DELETE queries. Below you may find a couple of examples.


```ts
await builder.delete()
    .table('metrics')
    .where('created_date', '>', '2022-12-20')
    .execute();
// Executes: ALTER TABLE metrics DELETE WHERE created_date > '2022-12-20'
```

If you want to delete everything from table use it as following: 

```ts
await builder.delete()
    .table('metrics')
    .all()
    .execute();
// Executes: ALTER TABLE metrics DELETE WHERE 1 = 1
```

Alternatively, you write example above as following: 

```ts
import {expr} from 'clickhouse-query';

await builder.delete()
    .table('metrics')
    .where(expr('1'), '=', 1)
    .execute();
// Executes: ALTER TABLE metrics DELETE WHERE 1 = 1
```

## UPDATE

Builder has special method called `update()` to handle UPDATE queries. Below you may find a couple of examples.

Update single column:

```ts
await builder.update()
    .table('metrics')
    .value('ip', '127.0.0.1')
    .where('ip', '=', '127.0.0.0')
    .execute();
// Executes: ALTER TABLE metrics UPDATE ip = '127.0.0.1' WHERE ip = '127.0.0.0'
```

Update multiple columns chained:

```ts
await builder.update()
    .table('metrics')
    .value('ip', '127.0.0.1')
    .value('user_agent', 'Googlebot/2.1')
    .where('ip', '=', '127.0.0.0')
    .execute();
// Executes: ALTER TABLE metrics UPDATE ip = '127.0.0.1', user_agent = 'Googlebot/2.1' WHERE ip = '127.0.0.0'
```

Alternatively, you can use `values()` to update multiple columns:

```ts
await builder.update()
    .table('metrics')
    .values([
      ['ip', '127.0.0.1'],
      ['user_agent', 'Googlebot/2.1'],
    ])
    .where('ip', '=', '127.0.0.0')
    .execute();
// Executes: ALTER TABLE metrics UPDATE ip = '127.0.0.1', user_agent = 'Googlebot/2.1' WHERE ip = '127.0.0.0'
```

You can pass array as value, it would be properly converted:

```ts
await builder.update()
    .table('metrics')
    .value('ips', ['127.0.0.1', '127.0.0.2'])
    .where('id', '=', 1)
    .execute();
// Executes: ALTER TABLE metrics UPDATE ips = ['127.0.0.1', '127.0.0.2'] WHERE id = 1
```

## SELECT

Builder has special method called `query()` which allows you to build SELECT queries. Below you may find a couple of examples.

Select single column:

```ts
await builder.query()
    .select('id')
    .from('users')
    .execute();
// Executes: SELECT id FROM users
```

Select multiple columns:

```ts
await builder.query()
    .select(['id', 'email'])
    .from('users')
    .execute();
// Executes: SELECT id, email FROM users
```

Select from sub-query:

```ts
await builder.query()
    .select(['ip'])
    .from(
        builder.query()
            .select('ip')
            .from('metrics')
    )
    .execute();
// Executes: SELECT ip FROM (SELECT ip FROM metrics)
```

Select with alias:

```ts
await builder.query()
    .select(['ip'])
    .from(
        builder.query()
            .select('ip')
            .from('metrics')
    )
    .as('m')
    .execute();
// Executes: (SELECT ip FROM metrics) AS m
```

### FINAL

Generates SQL query with `FINAL` keyword.

Useful for tables which use [ReplacingMergeTree](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replacingmergetree) engine to get rid-off duplicate entries.

```ts
await builder.query()
        .select(['id', 'email'])
        .final()
        .from('users')
        .where('id', '=', 1)
        .execute();
// Executes: SELECT id, email FROM users FINAL WHERE id = 1
```

### FROM

Select with table alias:

```ts
await builder.query()
    .select('id')
    .from('users', 'u')
    .execute();
// Executes: SELECT id FROM users u
````

### WHERE

The following operators are supported:

- `=`
- `<`
- `>`
- `>=`
- `<=`
- `!=`
- `BETWEEN`
- `IN`
- `NOT IN`
- `LIKE`
- `NOT LIKE`
- `IS NULL`
- `IS NOT NULL`

Simple condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('status', '=', 10)
    .execute();
// Executes: SELECT email FROM users WHERE status = 10
```

Where with AND condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('status', '>', 10)
    .andWhere('email', '=', 'john.doe@example.com')
    .execute();
// Executes: SELECT email FROM users WHERE status > 10 AND email LIKE 'john.doe@example.com'
```

Numeric `BETWEEN` condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('id', 'BETWEEN', [1, 100])
    .execute();
// Executes: SELECT email FROM users WHERE created_date BETWEEN 1 AND 100
```

Date `BETWEEN` condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('created_date', 'BETWEEN', ['2022-01-01', '2022-01-31'])
    .execute();
// Executes: SELECT email FROM users WHERE created_date BETWEEN '2022-01-01' AND '2022-01-31'
```

`IN`/`NOT IN` condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('id', 'IN', [1, 2, 3])
    .execute();
// Executes: SELECT email FROM users WHERE id IN (1, 2, 3)
```

`LIKE`/`NOT LIKE` condition:

```ts
await builder.query()
    .select(['email'])
    .from('users')
    .where('email', 'LIKE', '%@gmail.com')
    .execute();
// Executes: SELECT email FROM users WHERE email LIKE '%@gmail.com'
```

### HAVING

```ts
await await builder
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
    .execute();
// Executes: SELECT repo_name, sum(event_type = 'ForkEvent') AS forks, sum(event_type = 'WatchEvent') AS stars, round(stars / forks, 2) AS ratio FROM github_events WHERE event_type IN ('ForkEvent', 'WatchEvent') GROUP BY repo_name HAVING stars > 100 AND forks > 100 ORDER BY ratio DESC LIMIT 50
```

### JOIN

By default, if you provide `JOIN`, `INNER JOIN` would be used.

You may chain as multiple joins if needed.

```ts
await builder.query()
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
    .execute();
// Executes: SELECT id, first_name FROM users AS u INNER JOIN (SELECT user_id FROM posts WHERE id > 1) AS p ON p.user_id = u.user_id
```

### LIMIT/OFFSET

```ts
await builder.query()
    .select(['id', 'first_name'])
    .from('users')
    .limit(10)
    .offset(0)
    .generateSql();
// Executes: SELECT id, first_name FROM users OFFSET 0 ROW FETCH FIRST 10 ROWS ONLY
```

### WITH

```ts
await builder.query()
    .with([
        expr("toStartOfDay(toDate('2021-01-01'))").as('start'),
        expr("toStartOfDay(toDate('2021-01-02'))").as('end'),
    ])
    .select([
        fx.arrayJoin(
            expr('arrayMap(x -> toDateTime(x), range(toUInt32(start), toUInt32(end), 3600))')
        )
    ])
    .execute();
// Executes: WITH toStartOfDay(toDate('2021-01-01')) AS start, toStartOfDay(toDate('2021-01-02')) AS end SELECT arrayJoin(arrayMap(x -> toDateTime(x), range(toUInt32(start), toUInt32(end), 3600)))
```

Using constant expression as "variable":

```ts
import {expr} from 'clickhouse-query';

await builder.query()
    .with('2019-08-01 15:23:00', 'ts_upper_bound')
    .select('*')
    .from('hits')
    .where('EventDate', '=', expr('toDate(ts_upper_bound)'))
    .andWhere('EventTime', '<', expr('ts_upper_bound'))
    .execute();
// Executes: WITH '2019-08-01 15:23:00' AS ts_upper_bound SELECT * FROM hits WHERE EventDate = toDate(ts_upper_bound) AND EventTime < ts_upper_bound
```

Using results of a scalar subquery:

```ts
import {fx, expr} from 'clickhouse-query';

await builder.query()
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
    .execute();
// Executes: WITH (SELECT sum(bytes) FROM system.parts WHERE active = 1) AS total_disk_usage SELECT (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage, table FROM system.parts GROUP BY table ORDER BY table_disk_usage DESC LIMIT 10
```

### Helper Functions

Use `fx` helper to access ClickHouse functions.

All helpers are simply wrappers which add extra syntax sugaring to help your IDE hint function arguments.

```ts
import {fx} from 'clickhouse-query';
```

Usage example:

```ts
import {fx} from 'clickhouse-query';

await builder.query()
    .select([
        'user_id',
        fx.sum('trade_volume').as('volume')
    ])
    .from('user_spending')
    .groupBy(['user_id'])
    .execute();
// Executes: SELECT user_id, sum(trade_volume) AS volume FROM user_spending GROUP BY user_id
```

List of available helpers:

- `anyLast`
- `anyLastPos`
- `groupArray`
- `arrayJoin`
- `indexOf`
- `empty`
- `min`
- `max`
- `avgIf`
- `sum`
- `count`
- `countDistinct`
- `countIf`
- `abs`
- `if`
- `round`
- `subtractDays`
- `positionCaseInsensitive`
- `translateUTF8`

### More examples

For further query examples you can check `__tests__` folder.

## Tests

Tests could be found in `__tests__` folder.

Run tests:

```bash
yarn tests
```



