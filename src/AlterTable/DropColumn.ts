export class DropColumn extends String {
    private ifExistsPart: boolean = false;
    private namePart: string | null = null;


    public ifExists(): DropColumn {
        this.ifExistsPart = true;
        return this;
    }

    public name(name: string): DropColumn {
        this.namePart = name;
        return this;
    }

    public generateSql(): string {
        if (this.namePart === null) {
            throw new Error('No name specified to drop');
        }

        let sql = `DROP COLUMN`;
        if (this.ifExistsPart) {
            sql += ' IF EXISTS';
        }
        sql += ` ${this.namePart}`;
        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
