import {Expression} from './Expression';
import {Functions} from './Functions';

export const fx = new Functions();

export function expr(value: string): Expression {
    return new Expression(value);
}

