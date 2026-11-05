import type { UInt8, UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export class VertexModifier {
  idx: UInt32 = 0
  type: UInt32 = 0
  v: Vector3 = new Vector3()
  color: IColor = new IColor()
  vv: Vector3 = new Vector3()
  ii: UInt32 = 0
  c: UInt8 = 0

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeUInt32(this.type)
    handler.writeVector3(this.v)
    this.color.write(handler)
    if (this.type === 1) handler.writeVector3(this.vv)
    handler.writeUInt32(this.ii)
    handler.writeUInt8(this.c)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.idx = handler.readUInt32()
    instance.type = handler.readUInt32()
    instance.v = handler.readVector3()
    instance.color = IColor.read(handler)
    instance.vv = instance.type === 1 ? handler.readVector3() : new Vector3()
    instance.ii = handler.readUInt32()
    instance.c = handler.readUInt8()

    return instance
  }
}
