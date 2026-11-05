import type { Float, Int32, UInt32, UInt8 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'
import { SurfaceProperties } from '../SurfaceProperties.ts'

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
  idx: UInt32 = 0
  filename: string = ''
  pos: Vector3 = new Vector3()
  rot: Vector3 = new Vector3()
  fadeOutMin: Float = 0.0
  fadeOutMax: Float = 0.0
  surfaceProps: SurfaceProperties = new SurfaceProperties()
  color: IColor = new IColor()
  worldDetailLevel: UInt8 = 0
  unused: UInt8 = 0
  renderType: Int32 = 0
  useCachedModels: boolean = false
  wiggleAmpl: Int32 = 0

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
