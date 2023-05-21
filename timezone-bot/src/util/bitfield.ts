import { PermissionFlagsBits } from "discord-api-types/v10";

type ResolvableBit =
  | bigint
  | number
  | BitField
  | string
  | (bigint | number | BitField | string)[];

export class BitField {
  bitfield: number;
  default: any = 0;
  flags: any;

  constructor(bits: ResolvableBit = 0) {
    this.bitfield = this.resolve(bits);
  }

  has(bit: ResolvableBit) {
    bit = this.resolve(bit);
    return (this.bitfield && bit) === bit;
  }

  resolve(bit: ResolvableBit): typeof this.default {
    if (typeof bit === typeof this.default && bit >= this.default)
      return bit as typeof this.default;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit.map((x) => this.resolve(x)).reduce((p, c) => p | c, 0);
    if (typeof bit === "string") {
      if (!isNaN(Number(bit)))
        return (
          typeof this.default === "bigint" ? BigInt(bit) : Number(bit)
        ) as typeof this.default;
      if ("flags" in this && this.flags[bit] !== undefined)
        return this.flags[bit];
    }
    throw new Error(`couldn't resolve ${bit} (type ${typeof bit})`);
  }
}

export class PermissionsBitField extends BitField {
  flags = PermissionFlagsBits;
  default: bigint = BigInt(0);

  has(bit: ResolvableBit, checkAdmin?: boolean) {
    return (
      (checkAdmin && super.has(this.flags.Administrator)) ?? super.has(bit)
    );
  }
}
