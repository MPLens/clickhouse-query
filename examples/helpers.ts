import {ClickHouse} from 'clickhouse';

export async function dropTable(ch: ClickHouse, table: string) {
    await ch.query(`DROP TABLE IF EXISTS ${table}`).toPromise();
}

export async function truncateTable(ch: ClickHouse, table: string) {
    await ch.query(`ALTER TABLE ${table} DELETE WHERE 1=1`).toPromise();
}
