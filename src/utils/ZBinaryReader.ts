import { BinaryReader } from "./BinaryReader.ts";

export class ZBinaryReader extends BinaryReader {
  readZString() {
    const len = this.readUInt32()
    const string = this.readString(len)

    return string
  }
}
