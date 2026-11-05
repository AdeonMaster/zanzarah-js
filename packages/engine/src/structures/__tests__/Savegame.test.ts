import { describe, it } from "node:test"
import fs from "node:fs"
import assert from 'node:assert'
import { Savegame } from "../Savegame.ts"
import { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts"
import { ZBinaryReader } from "../../utils/ZBinaryReader.ts"

describe('Savegame class', () => {
  const instance = new Savegame()

  it('should properly write & read class', async () => {
    const fd = fs.openSync('tmp.bin', 'w+')
    const writeHandler = new ZBinaryWriter(fd)
    instance.write(writeHandler)
    fs.closeSync(fd)

    const fd2 = fs.openSync('tmp.bin', 'r')
    const readHandler = new ZBinaryReader(fd2)
    const tmp = Savegame.read(readHandler)
    fs.closeSync(fd2)

    fs.unlinkSync('tmp.bin')

    assert.deepStrictEqual(instance, tmp)
  })
})
