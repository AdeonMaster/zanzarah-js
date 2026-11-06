import type { ZBinaryReader, ZBinaryWriter } from '../../../index.ts'
import type { Float, UInt32 } from '../../../types.ts'
import { IColor } from '../../IColor.ts'
import type { Vector2 } from '../../math/Vector2.ts'
import { Vector3 } from '../../math/Vector3.ts'
import { VertexTriangle } from '../../VertexTriangle.ts'
import { GeometryFormat } from '../GeometryFormat.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'

export class MorphTarget {
  bsphereCenter: Vector3 = new Vector3()
  bsphereRadius: Float = 0.0
  vertices: Vector3[] = []
  normals: Vector3[] = []
}

export class RWGeometryStruct extends RWSection {
  format: UInt32 = 0
  ambient: Float = 0.0
  specular: Float = 0.0
  diffuse: Float = 0.0
  colors: IColor[] = []
  texCoords: Vector2[][] = []
  triangles: VertexTriangle[] = []
  morphTargets: MorphTarget[] = []

  override write(writer: ZBinaryWriter): void {}

  override read(reader: ZBinaryReader): void {
    this.format = reader.readUInt32()
    const trianglesCount = reader.readUInt32()
    const vertexCount = reader.readInt32()
    const morphTargetsCount = reader.readUInt32()
    this.triangles = new Array(trianglesCount)
    this.morphTargets = new Array(morphTargetsCount)
    this.ambient = reader.readFloat()
    this.specular = reader.readFloat()
    this.diffuse = reader.readFloat()

    if ((this.format & GeometryFormat.Native) === 0) {
      if ((this.format & GeometryFormat.Prelit) > 0) {
        this.colors = new Array(vertexCount)
        for (let i = 0; i < vertexCount; ++i) {
          this.colors[i] = IColor.read(reader)
        }
      }

      if (
        (this.format & (GeometryFormat.Textured | GeometryFormat.Textured2)) >
        0
      ) {
        let texCount = (this.format >> 16) & 0xff
        if (texCount === 0)
          texCount = (this.format & GeometryFormat.Textured2) > 0 ? 2 : 1
        this.texCoords = new Array(texCount)
        for (let i = 0; i < texCount; ++i) {
          this.texCoords[i] = new Array(vertexCount)
          for (let j = 0; j < vertexCount; ++j) {
            this.texCoords[i][j] = reader.readVector2()
          }
        }
      }

      for (let i = 0; i < trianglesCount; ++i) {
        this.triangles[i] = VertexTriangle.read(reader)
        //TODO: shuffle
      }
    }

    for (let i = 0; i < morphTargetsCount; ++i) {
      const morphTarget = new MorphTarget()
      morphTarget.bsphereCenter = reader.readVector3()
      morphTarget.bsphereRadius = reader.readFloat()
      const hasVertices = reader.readUInt32() > 0
      const hasNormals = reader.readUInt32() > 0
      if (hasVertices) {
        morphTarget.vertices = new Array(vertexCount)
        for (let j = 0; j < vertexCount; ++j) {
          morphTarget.vertices[j] = reader.readVector3()
        }
      }
      if (hasNormals) {
        morphTarget.normals = new Array(vertexCount)
        for (let j = 0; j < vertexCount; ++j) {
          morphTarget.normals[j] = reader.readVector3()
        }
      }
    }
  }
}

export class RWGeometry extends RWContainerSection {
  get struct(): RWGeometryStruct | null {
    return this.findChild(RWGeometryStruct)
  }
}
