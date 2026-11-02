import { ZBinaryReader } from "../../utils/ZBinaryReader.ts"
import { SectionId } from "./SectionID.ts"
import { IColor } from "../IColor.ts"

// Only recurse into types whose payload is a sequence of chunks.
const CONTAINER_TYPES = new Set<number>([
  SectionId.Extension,
  SectionId.Texture,
  SectionId.Material,
  SectionId.MaterialList,
  SectionId.FrameList,
  SectionId.Geometry,
  SectionId.Clump,
  SectionId.Atomic,
  SectionId.TextureDictionary,
  SectionId.GeometryList,
  SectionId.World,
  SectionId.AtomicSection,
  SectionId.Extension
])

class RWChunk {
  sectionName: string = ''

  sectionId: number = 0
  size: number = 0
  version: number = 0
  parent: RWChunk | null = null
  children: RWChunk[] = []
  data: { [x: string]: any } = {}
}

const parseChunkRange = (handler: ZBinaryReader, containerTypes: Set<number>, parent: RWChunk | null, depth: number = 0) => {
  const chunks: RWChunk[] = []

  while (handler.pos() < handler.length) {
    const sectionOffset = handler.pos()
    const remaining = handler.length - sectionOffset

    if (remaining < 4) {
      throw new Error(`Incomplete section ID at offset ${sectionOffset}`)
    }

    const sectionId = handler.readInt32()
    console.log(`${new Array(depth).fill('-').join('')}${SectionId[sectionId]}`)
    if (sectionId === SectionId.EOF) {
      break
    }

    if (remaining < 12) {
      throw new Error(
        `Incomplete section header at offset ${sectionOffset}: ${remaining} bytes remain`,
      )
    }

    const size = handler.readUInt32()
    const version = handler.readUInt32()

    if (size > handler.length - handler.pos()) {
      throw new Error(
        `Section 0x${sectionId.toString(16)} at offset ${sectionOffset} declares ${size} data bytes, but only ${handler.length - handler.pos()} remain`,
      )
    }

    const data = handler.readBytes(size)
    const reader = new ZBinaryReader(data)

    const instance = new RWChunk()
    instance.sectionName = SectionId[sectionId]
    instance.sectionId = sectionId
    instance.size = size
    instance.version = version
    instance.parent = parent
    instance.children = []

    if (sectionId == SectionId.Struct) {
      switch(parent?.sectionId) {
        case SectionId.World:
          instance.data.rootIsWorldSector = reader.readUInt32() > 0
          instance.data.origin = reader.readVector3()
          instance.data.ambient = reader.readFloat()
          instance.data.specular = reader.readFloat()
          instance.data.diffuse = reader.readFloat()
          instance.data.numTriangles = reader.readUInt32()
          instance.data.numVertices = reader.readUInt32()
          instance.data.numPlaneSectors = reader.readUInt32()
          instance.data.numWorldSectors = reader.readUInt32()
          instance.data.colSectorSize = reader.readUInt32()
          instance.data.format = reader.readUInt32()
          break
        case SectionId.MaterialList:
          const materialIndicesLen = reader.readUInt32()
          instance.data.materialIndices = new Array(materialIndicesLen)
          for (let i = 0; i < materialIndicesLen; ++i) {
            instance.data.materialIndices[i] = reader.readInt32()
          }
          break
        case SectionId.Material:
          instance.data.flags = reader.readUInt32()
          instance.data.color = IColor.read(reader)
          instance.data.isTextured = reader.readUInt32() > 0
          if ((reader.length - reader.pos()) > 0) instance.data.ambient = reader.readFloat()
          if ((reader.length - reader.pos()) > 0) instance.data.specular = reader.readFloat()
          if ((reader.length - reader.pos()) > 0) instance.data.diffuse = reader.readFloat()
          break
        case SectionId.AtomicSection:
          break
      }
    } else if (sectionId === SectionId.BinMeshPLG) {
      instance.data.type = reader.readInt32()
      const subMeshesLen = reader.readUInt32()
      instance.data.totalIndexCount = reader.readUInt32()
      instance.data.subMeshes = new Array(subMeshesLen)
      for(let i = 0; i < subMeshesLen; ++i) {
        const totalIndeces = reader.readUInt32()
        const matIndex = reader.readUInt32()
        const indices = new Array(totalIndeces)
        for(let j = 0; j < totalIndeces; ++j) {
          indices[j] = reader.readInt32()
        }

        instance.data.subMeshes[i] = {
          indices,
          matIndex
        }
      }
    }

    if (containerTypes.has(sectionId)) {
      instance.children = parseChunkRange(reader, containerTypes, instance, depth + 1)
    }

    chunks.push(instance)
  }

  return chunks
}

export class RWBinaryFile {
  static read(handler: ZBinaryReader) {
    return parseChunkRange(handler, CONTAINER_TYPES, null)
  }
}
