import { Quaternion } from '../structures/math/Quaternion.ts'
import { Vector2 } from '../structures/math/Vector2.ts'
import { Vector3 } from '../structures/math/Vector3.ts'
import { BinaryReader } from './BinaryReader.ts'

export class ZBinaryReader extends BinaryReader {
  readZString() {
    const len = this.readUInt32()
    const string = this.readString(len)

    return string
  }

  readVector2() {
    const x = this.readFloat()
    const y = this.readFloat()

    return new Vector2(x, y)
  }

  readVector3() {
    const x = this.readFloat()
    const y = this.readFloat()
    const z = this.readFloat()

    return new Vector3(x, y, z)
  }
  
  readQuaternion() {
    const x = this.readFloat()
    const y = this.readFloat()
    const z = this.readFloat()
    const w = this.readFloat()

    return new Quaternion(x, y, z, w)
  }
}
