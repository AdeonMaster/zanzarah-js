import type { Matrix4x4 } from '../structures/math/Matrix4x4.ts'
import type { Quaternion } from '../structures/math/Quaternion.ts'
import type { Vector2 } from '../structures/math/Vector2.ts'
import type { Vector3 } from '../structures/math/Vector3.ts'
import { BinaryWriter } from './BinaryWriter.ts'

export class ZBinaryWriter extends BinaryWriter {
  writeZString(str: string) {
    this.writeUInt32(str.length)
    this.writeString(str)
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

  writeMatrix4x4(v: Matrix4x4) {
    this.writeFloat(v.m11)
    this.writeFloat(v.m12)
    this.writeFloat(v.m13)
    this.writeFloat(v.m14)
    this.writeFloat(v.m21)
    this.writeFloat(v.m22)
    this.writeFloat(v.m23)
    this.writeFloat(v.m24)
    this.writeFloat(v.m31)
    this.writeFloat(v.m32)
    this.writeFloat(v.m33)
    this.writeFloat(v.m34)
    this.writeFloat(v.m41)
    this.writeFloat(v.m42)
    this.writeFloat(v.m43)
    this.writeFloat(v.m44)
  }
}
