import {ClickHouse} from 'clickhouse';
import {QueryBuilder} from '../src';
import {dropTable} from './helpers';

const clickhouse = new ClickHouse({
    url: 'http://localhost',
    port: 8123,
    format: 'json',
    raw: false,
});

const builder = new QueryBuilder(clickhouse);

(async () => {
    const table = 'test';
    await dropTable(clickhouse, table);
    await clickhouse
        .query(`CREATE TABLE IF NOT EXISTS ${table} (name String, created_date Date) ENGINE = Memory`)
        .toPromise();

    try {
        await builder.insert()
            .into(table)
            .columns(['name', 'created_date'])
            .values({name: 'Alex', created_date: new Date()})
            .execute();
        console.log('[OK] Inserted single row');
    } catch (e) {
        console.log('[ERR]:', e);
    }

    try {
        await builder.insert()
            .into(table)
            .columns(['name', 'created_date'])
            .values({name: 'Alex', created_date: new Date()})
            .values({name: 'John', created_date: new Date()})
            .execute();
        console.log('[OK] Inserted multiple rows chained');
    } catch (e) {
        console.log('[ERR]:', e);
    }

    try {
        await builder.insert()
            .into(table)
            .columns(['name', 'created_date'])
            .values([{name: 'Alex', created_date: new Date()}, {name: 'John', created_date: new Date()}])
            .execute();
        console.log('[OK] Inserted multiple rows as bulk');
    } catch (e) {
        console.log('[ERR]:', e);
    }

    const result = await builder.query()
        .select('*')
        .from(table)
        .execute();

    console.log('');
    console.log(`[OK] Fetched data from table "${table}":`);
    console.log(result);
})();

