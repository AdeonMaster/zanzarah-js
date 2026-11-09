import type { ZBinaryReader } from '../../../rw.ts'
import { RWSection } from '../RWSection.ts'

export class RWAnimationPLG extends RWSection {
  raw: Buffer = Buffer.alloc(0)

  override read(handler: ZBinaryReader) {
    this.raw = handler.readBytes(handler.length)
  }
}
