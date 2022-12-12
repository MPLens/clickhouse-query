# ClickHouse Query

ClickHouse Query is intuitive query builder to overcome the complexity of [ClickHouse](https://clickhouse.com/) SQL syntax.

## Features

- Sub-queries
- Table aliases
- Query aliases
- SELECT
- WITH clause
- JOINs
- WHERE/grouped WHERE
- GROUP BY
- ORDER BY
- LIMIT 
- OFFSET
- Helper functions, e.g. `fx.avg()`, `fx.countIf()`, etc
- Custom SQL expressions

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
import { fx, expr, Query } from 'clickhouse-query';
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
const logger = winston.createLogger();
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

### SELECT

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
// Executes: (SELECT ip FROM metriks) AS m
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
import {fx} from 'clickhouse-query';

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
    .as('hh')
    .execute();
// Executes: WITH toStartOfDay(toDate('2021-01-01')) AS start, toStartOfDay(toDate('2021-01-02')) AS end SELECT arrayJoin(arrayMap(x -> toDateTime(x), range(toUInt32(start), toUInt32(end), 3600))) AS hh
```

### Helper Functions 

Use `fx` helper to access ClickHouse functions.

```ts
import {fx} from 'clickhouse-query';
```

Example usage:

```ts
import {fx} from 'clickhouse-query';

await builder.query()
    .select([
        fx.anyLast(expr('created_date'))
    ])
    .from('users')
    .execute();
// Executes: SELECT anyLast(created_date) FROM users
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

## Tests

Tests could be found in `__tests__` folder.

Run tests:
```bash
yarn tests
```



