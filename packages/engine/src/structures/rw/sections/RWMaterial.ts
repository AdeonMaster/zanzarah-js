import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { IColor } from '../../IColor.ts'
import { RWContainerSection } from '../RWContainerSection.ts'
import { RWSection } from '../RWSection.ts'

export class RWMaterialStruct extends RWSection {
  flags = 0
  color!: IColor
  isTextured = false
  ambient?: number
  specular?: number
  diffuse?: number

  override read(reader: ZBinaryReader): void {
    const hasMore = () => reader.length - reader.pos() > 0

    this.flags = reader.readUInt32()
    this.color = IColor.read(reader)
    this.isTextured = reader.readUInt32() > 0
    if (hasMore()) this.ambient = reader.readFloat()
    if (hasMore()) this.specular = reader.readFloat()
    if (hasMore()) this.diffuse = reader.readFloat()
  }
}

export class RWMaterial extends RWContainerSection {
  get struct() {
    return this.findChild(RWMaterialStruct)
  }
}
