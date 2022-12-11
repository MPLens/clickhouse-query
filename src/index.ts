import {Expression} from './Expression';
import {Functions} from './Functions';
import {QueryBuilder} from './QueryBuilder';
import {Query} from './Query';

const fx = new Functions();

function expr(value: string): Expression {
    return new Expression(value);
}

export {QueryBuilder, Query, fx, expr};
