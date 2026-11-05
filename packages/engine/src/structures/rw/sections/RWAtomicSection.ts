import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { IColor } from '../../IColor.ts'
import type { Vector2 } from '../../math/Vector2.ts'
import type { Vector3 } from '../../math/Vector3.ts'
import { Normal } from '../../Normal.ts'
import { VertexTriangle } from '../../VertexTriangle.ts'
import { GeometryFormat } from '../GeometryFormat.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'
import { RWWorld } from './RWWorld.ts'

export class RWAtomicSectionStruct extends RWSection {
  matIdBase = 0
  bbox1!: Vector3
  bbox2!: Vector3
  vertices: Vector3[] = []
  normals?: Normal[]
  colors?: IColor[]
  texCoords1?: Vector2[]
  texCoords2?: Vector2[]
  triangles: VertexTriangle[] = []

  override read(reader: ZBinaryReader): void {
    // This is the bit that needs data from the World's struct. It's available
    // because the parser attaches chunks to the tree before parsing them, and
    // World's Struct is always the first child of World.
    const worldStruct = this.findAncestor(RWWorld)?.struct
    if (!worldStruct) {
      throw new Error(
        'AtomicSection struct found without a parsed World struct',
      )
    }
    if (worldStruct.isNative) {
      throw new Error(
        'Native (platform-specific) world sectors are not supported',
      )
    }
    const format = worldStruct.format

    this.matIdBase = reader.readUInt32()
    const numTriangles = reader.readUInt32()
    const numVertices = reader.readUInt32()
    this.bbox1 = reader.readVector3()
    this.bbox2 = reader.readVector3()
    reader.readUInt32() // padding / unused
    reader.readUInt32() // padding / unused

    const each = <T>(read: () => T): T[] =>
      Array.from({ length: numVertices }, read)

    this.vertices = each(() => reader.readVector3())

    if (format & GeometryFormat.Normals) {
      this.normals = each(() => Normal.read(reader))
    }
    if (format & GeometryFormat.Prelit) {
      this.colors = each(() => IColor.read(reader))
    }
    if (format & (GeometryFormat.Textured | GeometryFormat.Textured2)) {
      this.texCoords1 = each(() => reader.readVector2())
    }
    if (format & GeometryFormat.Textured2) {
      this.texCoords2 = each(() => reader.readVector2())
    }

    this.triangles = Array.from({ length: numTriangles }, () =>
      VertexTriangle.read(reader),
    )
  }
}

export class RWAtomicSection extends RWContainerSection {
  get struct(): RWAtomicSectionStruct | null {
    return this.findChild(RWAtomicSectionStruct)
  }
}
