import type { ZBinaryReader } from "../../utils/ZBinaryReader.ts";
import type { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts";
import { Section } from "./Section.ts";
import { SectionId } from "./SectionID.ts";

export class UnknownSection {

}

// export class UnknownSection extends Section {
//   private _sectionId: SectionId
//   override sectionId: SectionId = SectionId.Unknown
//   data: Buffer = Buffer.alloc(0)

//   constructor(sectionId: SectionId = SectionId.Unknown) {
//     super()
//     this._sectionId = sectionId
//   }

//   protected override readBody(handler: ZBinaryReader): void {
//     const dataLen = handler.length - handler.pos()
//     this.data = handler.readBytes(dataLen)
//     if (this.data.length != dataLen) throw new Error('UnknownSection.readBody: Could not read all of section')
//   }

//   protected override writeBody(handler: ZBinaryWriter): void {
//     handler.writeBytes(this.data)
//   }
// }
