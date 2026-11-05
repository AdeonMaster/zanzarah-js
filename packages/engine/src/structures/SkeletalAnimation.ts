import type { Float } from '../types.ts'
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'
import { Quaternion } from './math/Quaternion.ts'
import { Vector3 } from './math/Vector3.ts'

export class AnimationKeyFrame {
  rot: Quaternion = new Quaternion()
  pos: Vector3 = new Vector3()
  time: Float = 0
  parentFrameOffset: number = 0 //TODO: should be read/written?

  static ExpectedSize = (4 + 3 + 1 + 1) * 4

  write(handler: ZBinaryWriter) {
    handler.writeQuaternion(this.rot)
    handler.writeVector3(this.pos)
    handler.writeFloat(this.time)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.rot = handler.readQuaternion()
    instance.pos = handler.readVector3()
    instance.time = handler.readFloat()

    return instance
  }
}

export class SkeletalAnimation {
  flags: number = 0
  duration: number = 0.0
  boneFrames: AnimationKeyFrame[][] = []

  write(handler: ZBinaryWriter) {
    throw new Error('SkeletalAnimation.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const frameCount = handler.readInt32()

    const instance = new this()
    instance.flags = handler.readUInt32()
    instance.duration = handler.readFloat()

    const allFrames = new Array(frameCount)
    for (let i = 0; i < frameCount; ++i) {
      allFrames[i] = AnimationKeyFrame.read(handler)
    }

    const frameBones = new Array(frameCount)
    let nextBoneI = 0
    for (let i = 0; i < frameCount; ++i) {
      if (allFrames[i].parentFrameOffset < 0)
        // new unknown bone
        frameBones[i] = nextBoneI++
      else
        frameBones[i] =
          frameBones[
            allFrames[i].parentFrameOffset / AnimationKeyFrame.ExpectedSize
          ]
    }

    instance.boneFrames = [] // TODO: finish this!!

    return instance
  }
}
