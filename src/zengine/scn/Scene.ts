import type { BinaryReader } from "../../utils/BinaryReader.ts";
import type { BinaryWriter } from "../../utils/BinaryWriter.ts";

export class Scene {
  constructor() {

  }

  write(handler: BinaryWriter) {
    throw new Error("Scene.write: Not implemented yet")
  }

  static read(handler: BinaryReader) {

  }
}
