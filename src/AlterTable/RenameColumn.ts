export class RenameColumn extends String {
    private ifExistsPart: boolean = false;
    private oldNamePart: string | null = null;
    private newNamePart: string | null = null;


    public ifExists(): RenameColumn {
        this.ifExistsPart = true;
        return this;
    }

    /**
     * Old name of the column.
     */
    public from(oldName: string): RenameColumn {
        this.oldNamePart = oldName;
        return this;
    }

    /**
     * New name of the column.
     * @param newName
     */
    public to(newName: string): RenameColumn {
        this.newNamePart = newName;
        return this;
    }

    public generateSql(): string {

        if (this.oldNamePart === null) {
            throw new Error('No old name specified to rename');
        }

        if (this.newNamePart === null) {
            throw new Error('No new name specified to rename');
        }

        let sql = `RENAME COLUMN`;
        if (this.ifExistsPart) {
            sql += ' IF EXISTS';
        }

        sql += ` ${this.oldNamePart} TO ${this.newNamePart}`;
        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
