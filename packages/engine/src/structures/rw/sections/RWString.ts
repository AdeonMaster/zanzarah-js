import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWSection } from '../RWSection.ts'

export class RWString extends RWSection {
  value: string = ''

  override read(reader: ZBinaryReader): void {
    // RW pads strings with NULs up to a 4-byte boundary
    this.value = reader.readString(reader.length).replace(/\0+$/, '')
  }
}
