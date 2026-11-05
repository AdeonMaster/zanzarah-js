import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import type { Vector3 } from '../../math/Vector3.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'
import { RWMaterialList } from './RWMaterialList.ts'

const WORLD_FLAG_NATIVE = 0x01000000

export class RWWorldStruct extends RWSection {
  rootIsWorldSector = false
  origin!: Vector3
  ambient = 0
  specular = 0
  diffuse = 0
  numTriangles = 0
  numVertices = 0
  numPlaneSectors = 0
  numWorldSectors = 0
  colSectorSize = 0
  format = 0

  get isNative(): boolean {
    return (this.format & WORLD_FLAG_NATIVE) !== 0
  }

  override read(reader: ZBinaryReader): void {
    this.rootIsWorldSector = reader.readUInt32() > 0
    this.origin = reader.readVector3()
    this.ambient = reader.readFloat()
    this.specular = reader.readFloat()
    this.diffuse = reader.readFloat()
    this.numTriangles = reader.readUInt32()
    this.numVertices = reader.readUInt32()
    this.numPlaneSectors = reader.readUInt32()
    this.numWorldSectors = reader.readUInt32()
    this.colSectorSize = reader.readUInt32()
    this.format = reader.readUInt32()
  }
}

export class RWWorld extends RWContainerSection {
  get struct(): RWWorldStruct | null {
    return this.findChild(RWWorldStruct)
  }
  get materialList(): RWMaterialList | null {
    return this.findChild(RWMaterialList)
  }
}
