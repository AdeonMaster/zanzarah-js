import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWSection } from '../RWSection.ts'

/** Fallback for any chunk type we don't know how to parse. Keeps the raw bytes. */
export class RWUnknown extends RWSection {
  raw!: Buffer

  override read(reader: ZBinaryReader): void {
    this.raw = reader.readBytes(reader.length)
  }
}
