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

  // static read(handler: ZBinaryReader) {
  //   const header = readHead(handler)

  //   console.log(SectionId[header.sectionId], header.size)

  //   const readWorld = (handler: ZBinaryReader) => {
  //     const rootIsWorldSector = handler.readUInt32() > 0
  //     const origin = handler.readVector3()
  //     const ambient = handler.readFloat()
  //     const specular = handler.readFloat()
  //     const diffuse = handler.readFloat()
  //     const numTriangles = handler.readUInt32()
  //     const numVertices = handler.readUInt32()
  //     const numPlaneSectors = handler.readUInt32()
  //     const numWorldSectors = handler.readUInt32()
  //     const colSectorSize = handler.readUInt32()
  //     const format = handler.readUInt32()

  //     console.log({
  //       rootIsWorldSector,
  //       origin,
  //       ambient,
  //       specular,
  //       diffuse,
  //       numTriangles,
  //       numVertices,
  //       numPlaneSectors,
  //       numWorldSectors,
  //       colSectorSize,
  //       format
  //     })
  //   }

  //   switch(header.sectionId) {
  //     case SectionId.World:
  //       readWorld(handler)
  //       break
  //   }

  //   console.log(handler.pos())

  //   return null
  // }
}
