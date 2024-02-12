import {ClickHouseLike} from "../../ClickhouseLike"

export type ClickHouseDriver<T> = {
    createClient(drivee: T): ClickHouseLike;
}
