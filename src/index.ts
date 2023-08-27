import {Expression} from './Expression';
import {Functions} from './Functions';
import {QueryBuilder} from './QueryBuilder';
import {Query} from './Query';
import {SchemaType} from './SchemaType';

const fx = new Functions();
const schema = new SchemaType();

function expr(value: string): Expression {
    return new Expression(value);
}

export {QueryBuilder, Query, fx, expr, schema};
