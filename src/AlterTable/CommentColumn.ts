export class CommentColumn extends String {
    private ifExistsPart: boolean = false;
    private namePart: string | null = null;
    private commentPart: string | null = null;

    public ifExists(): CommentColumn {
        this.ifExistsPart = true;
        return this;
    }

    public name(name: string): CommentColumn {
        this.namePart = name;
        return this;
    }

    public comment(comment: string): CommentColumn {
        this.commentPart = comment;
        return this;
    }

    public generateSql(): string {

        if (this.namePart === null) {
            throw new Error('No column name specified to comment');
        }

        if (this.commentPart === null) {
            throw new Error(`No comment specified for column ${this.namePart}`);
        }

        let sql = `COMMENT COLUMN`;
        if (this.ifExistsPart) {
            sql += ' IF EXISTS';
        }

        sql += ` ${this.namePart} '${this.commentPart}'`;
        return sql;
    }

    toString(): string {
        return this.generateSql();
    }
}
