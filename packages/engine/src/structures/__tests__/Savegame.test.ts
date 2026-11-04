import { describe, it } from "node:test"
import assert from 'node:assert'
import { Savegame } from "../Savegame.ts"
import { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts"
import { ZBinaryReader } from "../../utils/ZBinaryReader.ts"

describe('Savegame class', () => {
  const instance = new Savegame()

  it('should properly write & read class', () => {
    const writeHandler = new ZBinaryWriter()
    instance.write(writeHandler)
    const writeBuffer = writeHandler.toBuffer()

    const readBuffer = Buffer.from(writeBuffer)
    const readHandler = new ZBinaryReader(readBuffer)
    const tmp = Savegame.read(readHandler)

    assert.deepStrictEqual(instance, tmp)
  })
})
