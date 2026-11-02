import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { SectionId } from './SectionID.ts'

const readHead = (handler: ZBinaryReader) => {
  const sectionId = handler.readInt32()
  const size = handler.readUInt32()
  const version = handler.readUInt32()

  return {
    sectionId,
    size,
    version
  }
}

const createSection = (sectionId: SectionId) => {
  
}

export class Section {
  constructor() {}

  write(handler: ZBinaryWriter) {}

  static read(handler: ZBinaryReader) {
    const header = readHead(handler)

    return null
  }
}
