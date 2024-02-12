export type QueryCursorLike = {
    toPromise(): Promise<Object[]>;
}

export type ClickHouseLike = {
    query(query: String, reqParams?: object): QueryCursorLike;
}
