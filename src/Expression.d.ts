export declare class Expression extends String {
    constructor(cmd: string | String);
    static value(cmd: string | String): Expression;
    as(alias: string): string;
}
