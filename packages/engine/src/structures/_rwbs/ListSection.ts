import type { ZBinaryReader } from "../../utils/ZBinaryReader.ts";
import { Section } from "./Section.ts";

export abstract class ListSection extends Section {
  children: Section[] = []

  protected override readBody(handler: ZBinaryReader) {
    this.children = []
    while((handler.length - handler.pos()) >= 12) {
      this.children.push(Section.read(handler))
    }
  }
}
