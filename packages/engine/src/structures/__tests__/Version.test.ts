import { describe, it } from "node:test"
import assert from 'node:assert'
import { Version } from "../Version.ts"
import { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts"
import { ZBinaryReader } from "../../utils/ZBinaryReader.ts"

describe('Version class', () => {
  const instance = new Version()
  instance.author = 'adeon'
  instance.date = '02.11'
  instance.time = '22:36'
  instance.year = 2026

  it('should properly write & read class', () => {
    const writeHandler = new ZBinaryWriter()
    instance.write(writeHandler)
    const writeBuffer = writeHandler.toBuffer()

    const readBuffer = Buffer.from(writeBuffer)
    const readHandler = new ZBinaryReader(readBuffer)
    const tmp = Version.read(readHandler)

    assert.deepStrictEqual(instance, tmp)
  })
})
