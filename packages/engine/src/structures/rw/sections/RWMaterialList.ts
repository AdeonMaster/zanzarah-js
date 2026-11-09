import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWContainerSection } from '../RWContainerSection.ts'
import { RWSection } from '../RWSection.ts'

export class RWMaterialListStruct extends RWSection {
  materialIndices: number[] = []

  override read(reader: ZBinaryReader): void {
    const count = reader.readUInt32()
    this.materialIndices = new Array(count)
    for (let i = 0; i < count; ++i) {
      this.materialIndices[i] = reader.readInt32()
    }
  }
}

export class RWMaterialList extends RWContainerSection {
  get struct() {
    return this.findChild(RWMaterialListStruct)
  }
}
