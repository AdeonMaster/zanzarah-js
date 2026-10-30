import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export class VertexModifier {
  idx: number
  type: number
  v: Vector3
  color: IColor
  vv: Vector3
  ii: number
  c: number

  constructor() {
    this.idx = 0
    this.type = 0
    this.v = new Vector3()
    this.color = new IColor()
    this.vv = new Vector3()
    this.ii = 0
    this.c = 0
  }

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
