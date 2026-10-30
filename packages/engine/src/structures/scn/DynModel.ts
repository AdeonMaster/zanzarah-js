import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export class DynModelData {
  a1: number
  a2: number
  a3: number
  a4: number
  a5: number
  a6: number
  a7: number
  someFlag: number
  someColor: IColor
  cc: number
  s1: string
  s2: string

  constructor() {
    this.a1 = 0.0
    this.a2 = 0.0
    this.a3 = 0.0
    this.a4 = 0.0
    this.a5 = 0.0
    this.a6 = 0.0
    this.a7 = 0.0
    this.someFlag = 0
    this.someColor = new IColor()
    this.cc = 0
    this.s1 = ''
    this.s2 = ''
  }
}

export class DynModel {
  idx: number
  c1: number
  c2: number
  pos: Vector3
  rot: Vector3
  f1: number
  f2: number
  v1: Vector3
  ii1: number
  ii2: number
  data: DynModelData[]

  constructor() {
    this.idx = 0
    this.c1 = 0
    this.c2 = 0
    this.pos = new Vector3()
    this.rot = new Vector3()
    this.f1 = 0.0
    this.f2 = 0.0
    this.v1 = new Vector3()
    this.ii1 = 0
    this.ii2 = 0
    this.data = []
  }

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
