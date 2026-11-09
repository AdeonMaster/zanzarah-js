import type { Float, UInt32, UInt8 } from '../../../types.ts'
import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../../utils/ZBinaryWriter.ts'
import { Matrix4x4 } from '../../math/Matrix4x4.ts'
import { RWSection } from '../RWSection.ts'

export enum BoneFlags {
  // the naming might be weird as it was intended
  // by RenderWare to represent matrix operations
  IsChildless = (1 << 0),
  HasNextSibling = (1 << 1),

  UnknownFlag3 = (1 << 3)
}

export class Bone {
  static ExpectedSize = (3 + 4 * 4) * 4

  id: UInt32 = 0
  idx: UInt32 = 0
  flags: BoneFlags = BoneFlags.IsChildless
  objectToBone: Matrix4x4 = new Matrix4x4()

  write(handler: ZBinaryWriter) {
    throw new Error('Bone.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.id = handler.readUInt32()
    instance.idx = handler.readUInt32()
    instance.flags = handler.readUInt32()
    instance.objectToBone = handler.readMatrix4x4()

    return instance
  }
}

export class RWSkinPLG extends RWSection {
  static BonesPerVertex = 4

  vertexIndices: UInt8[] = []
  vertexWeights: Float[] = []
  bones: Bone[] = []

  override write(handler: ZBinaryWriter) {
    throw new Error('RWSkinPLG.write: Not implemented yet')
  }

  override read(handler: ZBinaryReader) {
    const bonesCount = handler.readUInt32()
    const vertexCount = handler.readInt32()
    
    const totalVertexCount = vertexCount * RWSkinPLG.BonesPerVertex
    this.vertexIndices = new Array(totalVertexCount)
    for(let i = 0; i < totalVertexCount; ++i) {
      this.vertexIndices[i] = handler.readUInt8()
    }
    this.vertexWeights = new Array(totalVertexCount)
    for(let i = 0; i < totalVertexCount; ++i) {
      this.vertexWeights[i] = handler.readFloat()
    }
    this.bones = new Array(bonesCount)
    for(let i = 0; i < bonesCount; ++i) {
      this.bones[i] = Bone.read(handler)
    }
  }
}
