import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { FColor } from '../FColor.ts'
import { IColor } from '../IColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export class Misc {
  worldFile: string = ''
  worldPath: string = ''
  texturePath: string = ''
  ambientLight: FColor = new FColor()
  v1: Vector3 = new Vector3()
  v2: Vector3 = new Vector3()
  clearColor: IColor = new IColor()
  fogType: number = 0
  fogColor: IColor = new IColor()
  fogDistance: number = 0.0
  fogDensity: number = 0.0
  farClip: number = 0.0

  write(handler: ZBinaryWriter) {
    handler.writeZString(this.worldFile)
    handler.writeZString(this.worldPath)
    handler.writeZString(this.texturePath)
    this.ambientLight.write(handler)
    handler.writeVector3(this.v1)
    handler.writeVector3(this.v2)
    this.clearColor.write(handler)
    handler.writeUInt8(this.fogType)
    if (this.fogType !== 0) {
      this.fogColor.write(handler)
      handler.writeFloat(this.fogDistance)
    }
    handler.writeFloat(this.fogDensity)
    handler.writeFloat(this.farClip)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.worldFile = handler.readZString()
    instance.worldPath = handler.readZString()
    instance.texturePath = handler.readZString()
    instance.ambientLight = FColor.read(handler)
    instance.v1 = handler.readVector3()
    instance.v2 = handler.readVector3()
    instance.clearColor = IColor.read(handler)
    instance.fogType = handler.readUInt8()
    if (instance.fogType !== 0) {
      instance.fogColor = IColor.read(handler)
      instance.fogDistance = handler.readFloat()
    } else {
      instance.fogColor = new IColor()
      instance.fogDistance = 0.0
    }
    instance.fogDensity = handler.readFloat()
    instance.farClip = handler.readFloat()

    return instance
  }
}
