import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWSection } from '../RWSection.ts'

export interface SubMesh {
  matIndex: number
  indices: number[]
}

export class RWBinMeshPLG extends RWSection {
  type = 0
  totalIndexCount = 0
  subMeshes: SubMesh[] = []

  override read(reader: ZBinaryReader): void {
    this.type = reader.readInt32()
    const subMeshCount = reader.readUInt32()
    this.totalIndexCount = reader.readUInt32()
    this.subMeshes = new Array(subMeshCount)

    for (let i = 0; i < subMeshCount; ++i) {
      const indexCount = reader.readUInt32()
      const matIndex = reader.readUInt32()
      const indices = new Array<number>(indexCount)
      for (let j = 0; j < indexCount; ++j) {
        indices[j] = reader.readInt32()
      }
      this.subMeshes[i] = { matIndex, indices }
    }
  }
}
