import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import type { ListSection } from './ListSection.ts'
import { SectionId } from './SectionID.ts'
import { UnknownSection } from './UnknownSection.ts'

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
  return new UnknownSection(sectionId)
}

export abstract class Section {
  abstract sectionId: SectionId
  version: number = 0
  parent: ListSection | null = null

  protected abstract readBody(handler: ZBinaryReader): void
  protected abstract writeBody(handler: ZBinaryWriter): void

  read(handler: ZBinaryReader) {
    const { sectionId: readSectionId, size: readSize, version: readVersion } = readHead(handler)

    if (readSectionId != this.sectionId) {
      throw new Error(`Trying to read a "${readSectionId}" from a "${this.sectionId}"`)
    }

    this.version = readVersion

    const expectedEndPosition = handler.pos() + readSize
    this.readBody(handler)
    if (handler.pos() > expectedEndPosition) throw new Error("Section.read: Did not read section correctly")
    handler.seek(expectedEndPosition)
  }

  static read(handler: ZBinaryReader, parent = null) {
    const oldPosition = handler.pos()
    const { sectionId, size } = readHead(handler)
    handler.seek(oldPosition)

    const section = createSection(sectionId)
    section.parent = parent
    section.read(handler)

    return section
  }
}
