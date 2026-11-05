import { describe, it } from "node:test"
import fs from "node:fs"
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
    const fd = fs.openSync('ver.bin', 'w+')
    const writeHandler = new ZBinaryWriter(fd)
    instance.write(writeHandler)
    fs.closeSync(fd)

    const fd2 = fs.openSync('ver.bin', 'r')
    const readHandler = new ZBinaryReader(fd2)
    const tmp = Version.read(readHandler)
    fs.closeSync(fd2)

    fs.unlinkSync('ver.bin')

    assert.deepStrictEqual(instance, tmp)
  })
})
