export class Expression extends String {
    constructor(cmd: string|String) {
        super(cmd);
    }
    public static value(cmd: string|String): Expression {
        return new Expression(cmd);
    }
    public as(alias: string): string {
        return `${this.valueOf()} AS ${alias}`;
    }
}

Expression.prototype.toString = function (): string {
    return this.valueOf();
}
