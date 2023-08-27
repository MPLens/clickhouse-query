export class ModifyColumn extends String {
    private ifExistsPart: boolean = false;
    private namePart: string | null = null;
    private typePart: string | null = null;
    private isModifyPart: boolean = false;
    private isAlterPart: boolean = false;
    private isFirstPart: boolean = false;
    private afterPart: string | null = null;

    public ifExists(): ModifyColumn {
        this.ifExistsPart = true;
        return this;
    }

    public name(name: string): ModifyColumn {
        this.namePart = name;
        return this;
    }

    public type(name: string): ModifyColumn {
        this.typePart = name;
        return this;
    }

    public alter(): ModifyColumn {
        this.isAlterPart = true;
        return this;
    }

    public modify(): ModifyColumn {
        this.isModifyPart = true;
        return this;
    }

    public first(): ModifyColumn {
        this.isFirstPart = true;
        return this;
    }

    public after(column: string): ModifyColumn {
        this.afterPart = column;
        return this;
    }

    public generateSql(): string {

        if (this.namePart === null) {
            throw new Error('No name specified to modify');
        }

        if (this.typePart === null) {
            throw new Error('No type specified to modify');
        }

        if (!this.isAlterPart && !this.isModifyPart) {
            throw new Error('No action specified. Use alter() or modify().');
        }
        let sql = '';

        if (this.isModifyPart) {
            sql += 'MODIFY COLUMN';
        } else if (this.isAlterPart) {
            sql += 'ALTER COLUMN';
        }

        if (this.ifExistsPart) {
            sql += ' IF EXISTS';
        }

        if (this.isAlterPart) {
            sql += ` ${this.namePart} TYPE ${this.typePart}`;
        } else if (this.isModifyPart) {
            sql += ` ${this.namePart} ${this.typePart}`;
        }

        if (this.isFirstPart) {
            sql += ' FIRST';
        } else if (this.afterPart !== null) {
            sql += ` AFTER ${this.afterPart}`;
        }

        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
