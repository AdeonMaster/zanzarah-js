import type { BinaryReader } from "../utils/BinaryReader.ts";
import type { BinaryWriter } from "../utils/BinaryWriter.ts";

export class AnimationKeyFrame {
  constructor() {

  }

  write(handler: BinaryWriter) {
    throw new Error("AnimationKeyFrame.write: Not implemented yet")
  }

  static read(handler: BinaryReader) {
    const instance = new this()
    return instance
  }
}

export class SkeletalAnimation {
  constructor() {

  }

  write(handler: BinaryWriter) {
    throw new Error("SkeletalAnimation.write: Not implemented yet")
  }

  static read(handler: BinaryReader) {
    const frameCount = handler.readInt32()
    const flags = handler.readUInt32()
    const duration = handler.readFloat()

    //TODO: finish this

    const instance = new this()
    return instance
  }
}
