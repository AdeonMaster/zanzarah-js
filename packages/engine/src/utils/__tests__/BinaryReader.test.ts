import { describe, it } from "node:test"
import assert from 'node:assert'
import { BinaryReader } from "../BinaryReader.ts"

describe('BinaryReader class', () => {
  it('should properly read int', () => {
    const buffer = Buffer.from([1, 1, 0, 0])
    const handler = new BinaryReader(buffer)
    const value = handler.readUInt32()

    assert.strictEqual(value, 257)
  })
})
