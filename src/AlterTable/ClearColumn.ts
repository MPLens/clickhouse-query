export class ClearColumn extends String {
    private ifExistsPart: boolean = false;
    private namePart: string | null = null;
    private partitionPart: string | null = null;

    public ifExists(): ClearColumn {
        this.ifExistsPart = true;
        return this;
    }

    public name(name: string): ClearColumn {
        this.namePart = name;
        return this;
    }

    public inPartition(partition: string): ClearColumn {
        this.partitionPart = partition;
        return this;
    }

    public generateSql(): string {
        if (this.namePart === null) {
            throw new Error('No old name specified to rename');
        }

        if (this.partitionPart === null) {
            throw new Error('No partition specified to clear');
        }

        let sql = `CLEAR COLUMN`;
        if (this.ifExistsPart) {
            sql += ' IF EXISTS';
        }

        sql += ` ${this.namePart} IN PARTITION ${this.partitionPart}`;
        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
