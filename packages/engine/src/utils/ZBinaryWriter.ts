import type { Quaternion } from '../structures/math/Quaternion.ts'
import type { Vector2 } from '../structures/math/Vector2.ts'
import type { Vector3 } from '../structures/math/Vector3.ts'
import { BinaryWriter } from './BinaryWriter.ts'

export class ZBinaryWriter extends BinaryWriter {
  writeZString(str: string) {
    this.writeUInt32(str.length)
    this.writeString(str, str.length)
  }

  writeVector2(v: Vector2) {
    this.writeFloat(v.x)
    this.writeFloat(v.y)
  }

  writeVector3(v: Vector3) {
    this.writeFloat(v.x)
    this.writeFloat(v.y)
    this.writeFloat(v.z)
  }

  writeQuaternion(v: Quaternion) {
    this.writeFloat(v.x)
    this.writeFloat(v.y)
    this.writeFloat(v.z)
    this.writeFloat(v.w)
  }
}
