import { Vector3 } from '../zengine/math/Vector3.ts'
import { BinaryReader } from './BinaryReader.ts'

export class ZBinaryReader extends BinaryReader {
  readZString() {
    const len = this.readUInt32()
    const string = this.readString(len)

    return string
  }

  readVector3() {
    const x = this.readFloat()
    const y = this.readFloat()
    const z = this.readFloat()

    return new Vector3(x, y, z)
  }
}
