import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'
import { SurfaceProperties } from '../primitives/SurfaceProperties.ts'

export class Model {
  idx: number
  filename: string
  pos: Vector3
  rot: Vector3
  surfaceProps: SurfaceProperties
  color: IColor
  useCachedModels: boolean
  wiggleAmpl: number
  isVisualOnly: boolean

  constructor() {
    this.idx = 0
    this.filename = ''
    this.pos = new Vector3()
    this.rot = new Vector3()
    this.surfaceProps = new SurfaceProperties()
    this.color = new IColor()
    this.useCachedModels = false
    this.wiggleAmpl = 0
    this.isVisualOnly = false
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeZString(this.filename)
    handler.writeVector3(this.pos)
    handler.writeVector3(this.rot)
    this.surfaceProps.write(handler)
    this.color.write(handler)
    handler.writeBool(this.useCachedModels)
    handler.writeInt32(this.wiggleAmpl)
    handler.writeBool(this.isVisualOnly)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.idx = handler.readUInt32()
    instance.filename = handler.readZString()
    instance.pos = handler.readVector3()
    instance.rot = handler.readVector3()
    instance.surfaceProps = SurfaceProperties.read(handler)
    instance.color = IColor.read(handler)
    instance.useCachedModels = handler.readBool()
    instance.wiggleAmpl = handler.readInt32()
    instance.isVisualOnly = handler.readBool()

    return instance
  }
}
