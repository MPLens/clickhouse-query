import { Expression } from './Expression';
export declare class Functions {
    maybeConvertToColumn(value: string | number | Expression | null): string | number | Expression | null;
    /** Arrays **/
    anyLast(column: string | Expression): Expression;
    anyLastPos(value: string | Expression, position: number): Expression;
    groupArray(column: string | Expression): Expression;
    arrayJoin(column: string | Expression): Expression;
    indexOf(column: string | Expression, haystack: string | number | Expression): Expression;
    empty(column: string | Expression): Expression;
    /** Arrays end **/
    min(column: string | Expression): Expression;
    max(column: string | Expression): Expression;
    avg(value: string | Expression): Expression;
    avgIf(column: string | Expression, condition: string | Expression | null): Expression;
    sum(value: string | Expression): Expression;
    count(value: string | Expression): Expression;
    countDistinct(value: string | string[] | Expression): Expression;
    countIf(condition: string | Expression): Expression;
    abs(value: string | Expression): Expression;
    if(condition: string | Expression, trueValue: string | number | Expression | null, falseValue: string | number | Expression | null): Expression;
    round(column: string | Expression, precision: number): Expression;
    subtractDays(date: string, number: number | string | Expression): Expression;
    positionCaseInsensitive(haystack: string | Expression, needle: string | number | Expression): Expression;
    translateUTF8(column: string | Expression, from: string, to: string): Expression;
}
