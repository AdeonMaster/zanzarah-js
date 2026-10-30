import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'
import { SurfaceProperties } from '../primitives/SurfaceProperties.ts'

export const FOModelRenderType = {
  EarlySolid: 0,
  LateAdditive: 1,
  EnvMap32: 2,
  EnvMap64: 3,
  EnvMap96: 4, // Cathedral
  EnvMap128: 5,
  EnvMap196: 6, // London windows
  EnvMap255: 7, // London cupboard windows
  Solid: 8, // Metallic?
  LateSolid: 9, // Plants?
  Additive: 10, // Cob webs
  EarlyAdditive: 11,

  Unknown: -1,
}

export class FOModel {
  idx: number
  filename: string
  pos: Vector3
  rot: Vector3
  fadeOutMin: number
  fadeOutMax: number
  surfaceProps: SurfaceProperties
  color: IColor
  worldDetailLevel: number
  unused: number
  renderType: number
  useCachedModels: boolean
  wiggleAmpl: number

  constructor() {
    this.idx = 0
    this.filename = ''
    this.pos = new Vector3()
    this.rot = new Vector3()
    this.fadeOutMin = 0.0
    this.fadeOutMax = 0.0
    this.surfaceProps = new SurfaceProperties()
    this.color = new IColor()
    this.worldDetailLevel = 0
    this.unused = 0
    this.renderType = 0
    this.useCachedModels = false
    this.wiggleAmpl = 0
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeZString(this.filename)
    handler.writeVector3(this.pos)
    handler.writeVector3(this.rot)
    handler.writeFloat(this.fadeOutMin)
    handler.writeFloat(this.fadeOutMax)
    this.surfaceProps.write(handler)
    this.color.write(handler)
    handler.writeUInt8(this.worldDetailLevel)
    handler.writeUInt8(this.unused)
    handler.writeInt32(this.renderType)
    handler.writeBool(this.useCachedModels)
    handler.writeInt32(this.wiggleAmpl)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.idx = handler.readUInt32()
    instance.filename = handler.readZString()
    instance.pos = handler.readVector3()
    instance.rot = handler.readVector3()
    instance.fadeOutMin = handler.readFloat()
    instance.fadeOutMax = handler.readFloat()
    instance.surfaceProps = SurfaceProperties.read(handler)
    instance.color = IColor.read(handler)
    instance.worldDetailLevel = handler.readUInt8()
    instance.unused = handler.readUInt8()
    instance.renderType = handler.readInt32()
    instance.useCachedModels = handler.readBool()
    instance.wiggleAmpl = handler.readInt32()

    return instance
  }
}
