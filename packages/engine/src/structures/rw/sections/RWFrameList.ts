import type { ZBinaryReader, ZBinaryWriter } from '../../../index.ts'
import type { Int32 } from '../../../types.ts'
import { Vector3 } from '../../math/Vector3.ts'
import { RWContainerSection } from '../RWContainerSection.ts'
import { RWSection } from '../RWSection.ts'

export class Frame {
  rotMatrix0: Vector3 = new Vector3()
  rotMatrix1: Vector3 = new Vector3()
  rotMatrix2: Vector3 = new Vector3()
  position: Vector3 = new Vector3()
  frameIndex: Int32 = 0
  creationFlags: Int32 = 0

  public readonly ExpectedSize = 4 * 3 * 4 + 4 + 4

  write(writer: ZBinaryWriter) {
    writer.writeVector3(this.rotMatrix0)
    writer.writeVector3(this.rotMatrix1)
    writer.writeVector3(this.rotMatrix2)
    writer.writeVector3(this.position)
    writer.writeInt32(this.frameIndex)
    writer.writeInt32(this.creationFlags)
  }

  static read(reader: ZBinaryReader) {
    const instance = new this()
    instance.rotMatrix0 = reader.readVector3()
    instance.rotMatrix1 = reader.readVector3()
    instance.rotMatrix2 = reader.readVector3()
    instance.position = reader.readVector3()
    instance.frameIndex = reader.readInt32()
    instance.creationFlags = reader.readInt32()

    return instance
  }
}

export class RWFrameListStruct extends RWSection {
  frames: Frame[] = []

  override write(writer: ZBinaryWriter): void {
    writer.writeUInt32(this.frames.length)
    for (const frame of this.frames) {
      frame.write(writer)
    }
  }

  override read(reader: ZBinaryReader): void {
    const totalFrames = reader.readUInt32()
    this.frames = new Array(totalFrames)
    for (let i = 0; i < totalFrames; ++i) {
      this.frames[i] = Frame.read(reader)
    }
  }
}

export class RWFrameList extends RWContainerSection {
  get struct() {
    return this.findChild(RWFrameListStruct)
  }
}
