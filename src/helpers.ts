import {Expression} from './Expression';

export function processValue(value: string | number | null | Expression) {
    if (value instanceof Expression) {
        return value;
    }
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        return value;
    }
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    return value;
}
