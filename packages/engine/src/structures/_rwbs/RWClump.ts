import type { ZBinaryReader } from "../../utils/ZBinaryReader.ts"
import type { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts"
import { SectionId } from "./SectionID.ts"

export class RWClump {
  sectionId: SectionId = SectionId.Clump

  atomicCount: number = 0
  lightCount: number = 0
  camCount: number = 0

  writeStruct(handler: ZBinaryWriter) {
    handler.writeUInt32(this.atomicCount)
    handler.writeUInt32(this.lightCount)
    handler.writeUInt32(this.camCount)
  }

  readStruct(handler: ZBinaryReader) {
    this.atomicCount = 0
    this.lightCount = 0
    this.camCount = 0

    if (handler.length >= 4) {
      this.atomicCount = handler.readUInt32()
    }
    if (handler.length >= 8) {
      this.lightCount = handler.readUInt32()
    }
    if (handler.length >= 12) {
      this.camCount = handler.readUInt32()
    }
  }
}
