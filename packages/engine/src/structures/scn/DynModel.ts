import type { Float, UInt32, UInt8 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export class DynModelData {
  a1: Float = 0.0
  a2: Float = 0.0
  a3: Float = 0.0
  a4: Float = 0.0
  a5: Float = 0.0
  a6: Float = 0.0
  a7: Float = 0.0
  someFlag: UInt8 = 0
  someColor: IColor = new IColor()
  cc: UInt32 = 0
  s1: string = ''
  s2: string = ''
}

export class DynModel {
  idx: UInt32 = 0
  c1: UInt32 = 0
  c2: UInt32 = 0
  pos: Vector3 = new Vector3()
  rot: Vector3 = new Vector3()
  f1: Float = 0.0
  f2: Float = 0.0
  v1: Vector3 = new Vector3()
  ii1: UInt32 = 0
  ii2: UInt32 = 0
  data: DynModelData[] = []

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeUInt32(this.c1)
    handler.writeUInt32(this.c2)
    handler.writeVector3(this.pos)
    handler.writeVector3(this.rot)
    handler.writeFloat(this.f1)
    handler.writeFloat(this.f2)
    handler.writeVector3(this.v1)
    handler.writeUInt32(this.ii1)
    handler.writeUInt32(this.ii2)
    for (let i = 0; i < 3; ++i) {
      handler.writeFloat(this.data[i].a1)
      handler.writeFloat(this.data[i].a2)
      handler.writeFloat(this.data[i].a3)
      handler.writeFloat(this.data[i].a4)
      handler.writeFloat(this.data[i].a5)
      handler.writeFloat(this.data[i].a6)
      handler.writeFloat(this.data[i].a7)
      handler.writeUInt8(this.data[i].someFlag)
      this.data[i].someColor.write(handler)
      handler.writeUInt32(this.data[i].cc)
      handler.writeZString(this.data[i].s1)
      handler.writeZString(this.data[i].s2)
    }
  }

  static read(handler: ZBinaryReader) {
    const intance = new this()
    intance.idx = handler.readUInt32()
    intance.c1 = handler.readUInt32()
    intance.c2 = handler.readUInt32()
    intance.pos = handler.readVector3()
    intance.rot = handler.readVector3()
    intance.f1 = handler.readFloat()
    intance.f2 = handler.readFloat()
    intance.v1 = handler.readVector3()
    intance.ii1 = handler.readUInt32()
    intance.ii2 = handler.readUInt32()
    intance.data = [new DynModelData(), new DynModelData(), new DynModelData()]
    for (let i = 0; i < 3; ++i) {
      intance.data[i].a1 = handler.readFloat()
      intance.data[i].a2 = handler.readFloat()
      intance.data[i].a3 = handler.readFloat()
      intance.data[i].a4 = handler.readFloat()
      intance.data[i].a5 = handler.readFloat()
      intance.data[i].a6 = handler.readFloat()
      intance.data[i].a7 = handler.readFloat()
      intance.data[i].someFlag = handler.readUInt8()
      intance.data[i].someColor = IColor.read(handler)
      intance.data[i].cc = handler.readUInt32()
      intance.data[i].s1 = handler.readZString()
      intance.data[i].s2 = handler.readZString()
    }

    return intance
  }
}
