export class AddColumn extends String {
    private ifNotExistsPart: boolean = false;
    private isFirstPart: boolean = false;
    private afterPart: string | null = null;

    private namePart: string | null = null;
    private typePart: string | null = null;


    public ifNotExists(): AddColumn {
        this.ifNotExistsPart = true;
        return this;
    }

    public name(name: string): AddColumn {
        this.namePart = name;
        return this;
    }

    /**
     * @param {String} type Use `import {schema} from 'clickhouse-query';` to get the list of types.
     */
    public type(type: string): AddColumn {
        this.typePart = type;
        return this;
    }

    public first(): AddColumn {
        this.isFirstPart = true;
        return this;
    }

    public after(columnName: string): AddColumn {
        this.afterPart = columnName;
        return this;
    }

    public generateSql(): string {
        if (this.namePart === null) {
            throw new Error('No name specified to add');
        }
        if (this.typePart === null) {
            throw new Error('No type specified to add');
        }

        let sql = `ADD COLUMN`;
        if (this.ifNotExistsPart) {
            sql += ' IF NOT EXISTS';
        }

        sql += ` ${this.namePart} ${this.typePart}`;

        if (this.isFirstPart) {
            sql += ' FIRST';
        }
        if (this.afterPart !== null) {
            sql += ` AFTER ${this.afterPart}`;
        }
        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
