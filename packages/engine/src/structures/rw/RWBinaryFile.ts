import { ZBinaryReader } from "../../utils/ZBinaryReader.ts"
import { SectionId } from "./SectionID.ts"
import { IColor } from "../IColor.ts"
import { GeometryFormat } from "./GeometryFormat.ts"
import { Normal } from "../Normal.ts"
import { VertexTriangle } from "../VertexTriangle.ts"

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
        `Section ${SectionId[sectionId]} at offset ${sectionOffset} declares ${size} data bytes, but only ${handler.length - handler.pos()} remain`,
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

    if (containerTypes.has(sectionId)) {
      instance.children = parseChunkRange(reader, containerTypes, instance, depth + 1)
    }

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
          instance.data.matIdBase = reader.readUInt32()
          instance.data.triangles = new Array(reader.readUInt32())
          instance.data.vertices = new Array(reader.readUInt32())
          instance.data.bbox1 = reader.readVector3()
          instance.data.bbox2 = reader.readVector3()
          reader.readUInt32() // padding, unused?
          reader.readUInt32() // padding, unused?
          for(let i = 0; i < instance.data.vertices.length; ++i) {
            instance.data.vertices[i] = reader.readVector3()
          }
          console.log(instance.parent.parent)
          // const worldFormat = instance.parent?.data.format
          // // console.log(instance.parent.parent?.children)
          // if ((worldFormat & GeometryFormat.Normals) > 0) {
          //   instance.data.normals = new Array(instance.data.vertices.length)
          //   for(let i = 0; i < instance.data.vertices.length; ++i) {
          //     instance.data.normals[i] = Normal.read(handler)
          //   }
          // }
          // if ((worldFormat & GeometryFormat.Prelit) > 0) {
          //   instance.data.colors = new Array(instance.data.vertices.length)
          //   for(let i = 0; i < instance.data.vertices.length; ++i) {
          //     instance.data.colors[i] = IColor.read(handler)
          //   }
          // }
          // if ((worldFormat & (GeometryFormat.Textured | GeometryFormat.Textured2)) > 0) {
          //   instance.data.texCoords1 = new Array(instance.data.vertices.length)
          //   for(let i = 0; i < instance.data.vertices.length; ++i) {
          //     instance.data.texCoords1[i] = handler.readVector2()
          //   }
          // }
          // if ((worldFormat & GeometryFormat.Textured) > 0) {
          //   instance.data.texCoords2 = new Array(instance.data.vertices.length)
          //   for(let i = 0; i < instance.data.vertices.length; ++i) {
          //     instance.data.texCoords2[i] = handler.readVector2()
          //   }
          // }
          // for(let i = 0; i < instance.data.triangles.length; ++i) {
          //   instance.data.triangles[i] = VertexTriangle.read(handler)
          // }
          console.log(reader.pos(), reader.length)
          break
        case SectionId.Texture:
          instance.data.filterMode = reader.readInt8()
          const addressing = reader.readInt8()
          instance.data.uAddressingMode = addressing & 0xf
          instance.data.vAddressingMode = addressing >> 4
          instance.data.flags = reader.readUInt16()
          instance.data.useMipLevels = (instance.data.flags & 1) > 0
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
    } else if (sectionId === SectionId.String) {
      instance.data.value = reader.readString(reader.length)
    }

    if (reader.pos() !== reader.length && Object.keys(instance.data).length === 0) {
      console.log("(Data isn't parsed)")
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
