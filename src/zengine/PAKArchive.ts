import type { ZBinaryReader } from "../utils/ZBinaryReader.ts"

export type PAKArchiveEntry = {
  path: string
  offset: number
  size: number
}

export class PAKArchive {
  public id: number
  public entries: PAKArchiveEntry[]

  constructor() {
    this.id = 0
    this.entries = []
  }

  static read(handler: ZBinaryReader) {
    const id = handler.readUInt32()
    const entriesCount = handler.readUInt32()
    const entries = new Array(entriesCount)
    for(let i = 0; i < entriesCount; ++i) {
      const path = handler.readZString()
      const offset = handler.readUInt32()
      const size = handler.readUInt32()

      entries[i] = {
        path,
        offset,
        size
      }
    }

    const pack = new this()
    pack.id = id
    pack.entries = entries
  }
}
