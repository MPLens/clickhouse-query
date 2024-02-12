import {Expression} from './Expression';
import {Functions} from './Functions';
import {QueryBuilder} from './QueryBuilder';
import {Query} from './Query';
import {SchemaType} from './SchemaType';
import {ClickHouseDriver} from './Drivers/ClickhouseClient/Driver';
import {ClickhouseClientDriver} from './Drivers/ClickhouseClient/ClickhouseClientDriver';

const fx = new Functions();
const schema = new SchemaType();

function expr(value: string): Expression {
    return new Expression(value);
}

export {QueryBuilder, Query, fx, expr, schema, ClickHouseDriver, ClickhouseClientDriver};
