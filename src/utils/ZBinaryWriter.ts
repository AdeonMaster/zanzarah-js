import { BinaryWriter } from "./BinaryWriter.ts";

export class ZBinaryWriter extends BinaryWriter {
  writeZString(str: string) {
    this.writeUInt32(str.length)
    this.writeString(str, str.length)
  }
}
