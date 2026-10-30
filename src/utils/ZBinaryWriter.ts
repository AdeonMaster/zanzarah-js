import type { Vector3 } from '../zengine/math/Vector3.ts'
import { BinaryWriter } from './BinaryWriter.ts'

export class ZBinaryWriter extends BinaryWriter {
  writeZString(str: string) {
    this.writeUInt32(str.length)
    this.writeString(str, str.length)
  }

  writeVector3(v: Vector3) {
    this.writeFloat(v.x)
    this.writeFloat(v.y)
    this.writeFloat(v.z)
  }
}
