export class SchemaType extends String {

    private value: string | null = null;

    public nullable(type: string) {
        this.value = `Nullable(${type})`;
        return this.value;
    }

    public int8() {
        this.value = `Int8`;
        return this.value;
    }

    public int16() {
        this.value = `Int16`;
        return this.value;
    }

    public int32() {
        this.value = `Int32`;
        return this.value;
    }

    public int64() {
        this.value = `Int64`;
        return this.value;
    }

    public int128() {
        this.value = `Int128`;
        return this.value;
    }

    public int256() {
        this.value = `Int256`;
        return this.value;
    }

    public uInt8() {
        this.value = `UInt8`;
        return this.value;
    }

    public uInt16() {
        this.value = `UInt16`;
        return this.value;
    }

    public uInt32() {
        this.value = `UInt32`;
        return this.value;
    }

    public uInt64() {
        this.value = `UInt64`;
        return this.value;
    }

    public uInt128() {
        this.value = `UInt128`;
        return this.value;
    }

    public uInt256() {
        this.value = `UInt256`;
        return this.value;
    }

    public float32() {
        this.value = `Float32`;
        return this.value;
    }

    public float64() {
        this.value = `Float64`;
        return this.value;
    }

    public decimal(precision: number, scale: number) {
        this.value = `Decimal(${precision}, ${scale})`;
        return this.value;
    }

    public decimal32(precision: number, scale: number) {
        this.value = `Decimal32(${precision}, ${scale})`;
        return this.value;
    }

    public decimal64(precision: number, scale: number) {
        this.value = `Decimal64(${precision}, ${scale})`;
        return this.value;
    }

    public decimal128(precision: number, scale: number) {
        this.value = `Decimal128(${precision}, ${scale})`;
        return this.value;
    }

    public decimal256(precision: number, scale: number) {
        this.value = `Decimal256(${precision}, ${scale})`;
        return this.value;
    }

    public boolean() {
        this.value = `Bool`;
        return this.value;
    }

    public string() {
        this.value = `String`;
        return this.value;
    }

    public fixedString(length: number) {
        this.value = `FixedString(${length})`;
        return this.value;
    }

    public uuid() {
        this.value = `UUID`;
        return this.value;
    }

    public date() {
        this.value = `Date`;
        return this.value;
    }

    public date32() {
        this.value = `Date32`;
        return this.value;
    }

    public dateTime(timezone: string | null = null) {
        if (timezone) {
            this.value = `DateTime('${timezone}')`;
            return this.value;
        }
        this.value = `DateTime`;
        return this.value;
    }

    public dateTime64(precision: number, timezone: string | null = null) {
        if (timezone) {
            this.value = `DateTime64(${precision}, '${timezone}')`;
            return this.value;
        }
        this.value = `DateTime64(${precision})`;
        return this.value;
    }

    public enum(values: Record<string, number> | string[]) {
        this.value = this.enumInternal('Enum', values);
        return this.value;
    }

    public enum8(values: Record<string, number> | string[]) {
        this.value = this.enumInternal('Enum8', values);
        return this.value;
    }

    public enum16(values: Record<string, number> | string[]) {
        this.value = this.enumInternal('Enum16', values);
        return this.value;
    }

    private enumInternal(enumType: string, values: Record<string, number> | string[]) {
        if (Array.isArray(values)) {
            return `${enumType}(${values.map((v) => `'${v}'`).join(', ')})`;
        }

        const enumParts = [];
        for (const key in values) {
            enumParts.push(`'${key}' = ${values[key]}`);
        }
        return `${enumType}(${enumParts.join(', ')})`;
    }

    public lowCardinality(type: string) {
        this.value = `LowCardinality(${type})`;
        return this.value;
    }

    public array(type: string) {
        this.value = `Array(${type})`;
        return this.value;
    }

    public json() {
        this.value = 'JSON';
        return this.value;
    }

    public tuple(types: Array<[name: string, type: string]>) {
        const tupleParts = [];
        for (const [name, type] of types) {
            tupleParts.push(`${name} ${type}`);
        }
        this.value = `Tuple(${tupleParts.join(', ')})`;
        return this.value;
    }

    toString(): string {
        if (!this.value) {
            throw new Error('SchemaType has no value defined');
        }
        return this.value;
    }
}
