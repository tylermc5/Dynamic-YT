// Mock for @/generated/prisma/runtime/library
// The Decimal type is only used for type coercion via Number() in matching.ts
export class Decimal {
  private value: number
  constructor(v: number | string) {
    this.value = typeof v === 'string' ? parseFloat(v) : v
  }
  valueOf() {
    return this.value
  }
  toString() {
    return this.value.toString()
  }
}
