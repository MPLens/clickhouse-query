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
- [INSERT](#insert)
- [SELECT](#select)
  * [FROM](#from)
  * [WHERE](#where)
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

Once the package is installed, you can import the library using import:

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

## INSERT

Insert single row:

```ts
await builder.query()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')
```

Definition of `columns()` is optional, you can use `values()` without it. `values()` will use the first row to determine
the columns.

```ts
await builder.query()
    .into('metrics')
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20')
```

You can chain multiple rows using `values()`:

```ts
await builder.query()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values({id: 1, ip: '127.0.0.1', created_date: '2022-12-20'})
    .values({id: 2, ip: '127.0.0.2', created_date: '2022-12-21'})
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')
```

You can write bulk rows: 

```ts
await builder.query()
    .into('metrics')
    .columns(['id', 'ip', 'created_date'])
    .values([
        {id: 1, ip: '127.0.0.1', created_date: '2022-12-20'},
        {id: 2, ip: '127.0.0.2', created_date: '2022-12-21'}
    ])
    .execute();
// Executes: INSERT INTO metrics (id, ip, created_date) VALUES (1, '127.0.0.1', '2022-12-20'), (2, '127.0.0.2', '2022-12-21')
```

## SELECT

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

### FROM

Select with table alias:

```ts
await builder.query()
    .select('id')
    .from('users', 'u')
    .execute();
// Executes: SELECT id FROM users AS u
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



