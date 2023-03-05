import {Expression} from './Expression';
import {processValue} from './helpers';

export class Functions {

    public maybeConvertToColumn(value: string | number | Expression | null): string | number | Expression | null {
        if (value instanceof Expression) {
            return value;
        }
        if (typeof value === 'string') {
            return new Expression(value);
        }
        return value;
    }

    /** Arrays **/

    public anyLast(column: string | Expression): Expression {
        return new Expression(`anyLast(${processValue(this.maybeConvertToColumn(column))})`);
    }

    public anyLastPos(value: string | Expression, position: number): Expression {
        return new Expression(`anyLast(${processValue(this.maybeConvertToColumn(value))})[${position}]`);
    }

    public groupArray(column: string | Expression): Expression {
        return new Expression(`groupArray(${processValue(this.maybeConvertToColumn(column))})`);
    }

    public arrayJoin(column: string | Expression): Expression {
        return new Expression(`arrayJoin(${processValue(this.maybeConvertToColumn(column))})`);
    }

    public indexOf(column: string | Expression, haystack: string | number | Expression): Expression {
        return new Expression(
            `indexOf(${processValue(this.maybeConvertToColumn(column))}, ${processValue(haystack)})`
        );
    }

    public empty(column: string | Expression): Expression {
        return new Expression(`empty(${processValue(column)})`);
    }

    /** Arrays end **/

    public min(column: string | Expression): Expression {
        return new Expression(`min(${processValue(this.maybeConvertToColumn(column))})`);
    }

    public max(column: string | Expression): Expression {
        return new Expression(`max(${processValue(this.maybeConvertToColumn(column))})`);
    }

    public avg(value: string | Expression): Expression {
        return new Expression(`avg(${processValue(this.maybeConvertToColumn(value))})`);
    }

    public avgIf(column: string | Expression, condition: string | Expression | null): Expression {
        return new Expression(`avgIf(${processValue(this.maybeConvertToColumn(column))}, ${condition})`);
    }

    public sum(value: string | Expression): Expression {
        return new Expression(`sum(${processValue(this.maybeConvertToColumn(value))})`);
    }

    public count(value: string | Expression): Expression {
        return new Expression(`count(${processValue(this.maybeConvertToColumn(value))})`);
    }

    public countDistinct(value: string | string[] | Expression): Expression {
        let normalizedValue: unknown;
        if (Array.isArray(value)) {
            normalizedValue = value.map((v) => processValue(this.maybeConvertToColumn(v))).join(', ');
        } else {
            normalizedValue = processValue(this.maybeConvertToColumn(value));
        }
        return new Expression(`count(DISTINCT ${normalizedValue})`);
    }

    public countIf(condition: string | Expression): Expression {
        return new Expression(`countIf(${processValue(this.maybeConvertToColumn(condition))})`);
    }

    public abs(value: string | Expression): Expression {
        return new Expression(`abs(${processValue(this.maybeConvertToColumn(value))})`);
    }

    public if(
        condition: string | Expression,
        trueValue: string | number | Expression | null,
        falseValue: string | number | Expression | null
    ): Expression {
        return new Expression(
            `if(${condition}, ${processValue(this.maybeConvertToColumn(trueValue))}, ${processValue(this.maybeConvertToColumn(falseValue))})`
        );
    }

    public round(column: string | Expression, precision: number): Expression {
        return new Expression(`round(${processValue(this.maybeConvertToColumn(column))}, ${precision})`);
    }

    public subtractDays(date: string, number: number | string | Expression): Expression {
        return new Expression(`subtractDays(${date}, ${processValue(number)})`);
    }

    public positionCaseInsensitive(haystack: string | Expression, needle: string | number | Expression): Expression {
        return new Expression(`positionCaseInsensitive(${this.maybeConvertToColumn(haystack)}, ${processValue(needle)})`);
    }

    public translateUTF8(column: string | Expression, from: string, to: string): Expression {
        return new Expression(`translateUTF8(${processValue(this.maybeConvertToColumn(column))}, '${from}', '${to}')`);
    }

    public argMin(arg:string, column: string): Expression {
        return new Expression(`argMin(${arg}, ${column})`);
    }

    public argMax(arg:string, column: string): Expression {
        return new Expression(`argMax(${arg}, ${column})`);
    }
}
