import {ClickHouseClient} from '@clickhouse/client';
import {ClickHouseDriver} from './Driver';

export class ClickhouseClientDriver implements ClickHouseDriver<ClickHouseClient> {
    createClient(client: ClickHouseClient) {
        return {
            query(query: string, reqParams: Record<string, unknown>) {
                return {
                    async toPromise() {
                        const cursor = await client.query({
                            query,
                            query_params: reqParams
                        });

                        return cursor.json() as Promise<Object[]>;
                    }
                };
            }
        }
    }
}
