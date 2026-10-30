// https://github.com/Helco/zzio/blob/master/zzio/ActorExDescription.cs
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class ActorPartDescription {
  model: string
  animationPoolID: number
  animations: [number, string][]

  constructor() {
    this.model = ''
    this.animationPoolID = -1
    this.animations = []
  }
}

export class ActorExDescription {
  body: ActorPartDescription
  wings: ActorPartDescription
  attachWingsToBone: number
  headBoneID: number
  effectBoneID: number

  constructor() {
    this.body = new ActorPartDescription()
    this.wings = new ActorPartDescription()
    this.attachWingsToBone = -1
    this.headBoneID = -1
    this.effectBoneID = -1
  }

  write(handler: ZBinaryWriter) {
    throw new Error('ActorExDescription.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const mainSectionName = handler.readZString()
    if (mainSectionName !== '[ActorExDescriptionFile]')
      throw new Error(
        'ActorExDescription.read: Not an actorex description file',
      )

    const bodyAnimations: [number, string][] = []
    const wingsAnimations: [number, string][] = []

    const actor = new this()

    let stopParsing = false
    while (!stopParsing) {
      const sectionName = handler.readZString()

      switch (sectionName) {
        case '[ModelFilename_Body]': {
          const model = handler.readZString()

          actor.body.model = model
          break
        }
        case '[AnimationPoolID_Body]': {
          const animationPoolID = handler.readInt32()

          actor.body.animationPoolID = animationPoolID
          break
        }
        case '[AnimationFilename_Body]': {
          const name = handler.readZString()
          const type = handler.readInt32()

          bodyAnimations.push([type, name])
          break
        }
        case '[ModelFilename_Wings]': {
          const model = handler.readZString()

          actor.wings.model = model
          break
        }
        case '[AnimationPoolID_Wings]': {
          const animationPoolID = handler.readInt32()

          actor.wings.animationPoolID = animationPoolID
          break
        }
        case '[AnimationFilename_Wings]': {
          const name = handler.readZString()
          const type = handler.readInt32()

          wingsAnimations.push([type, name])
          break
        }
        case '[AttachWingsToBone]': {
          const attachWingsToBone = handler.readInt32()

          actor.attachWingsToBone = attachWingsToBone
          break
        }
        case '[HeadBoneID]': {
          const headBoneID = handler.readInt32()

          actor.headBoneID = headBoneID
          break
        }
        case '[EffectBoneID]': {
          const effectBoneID = handler.readInt32()

          actor.effectBoneID = effectBoneID
          break
        }
        case '[EOS]': {
          stopParsing = true
          break
        }
        default:
          throw new Error(
            `ActorExDescription.read: Invalid actorex description section "${sectionName}"`,
          )
      }
    }

    actor.body.animations = [...actor.body.animations, ...bodyAnimations]
    actor.wings.animations = [...actor.wings.animations, ...wingsAnimations]

    return actor
  }
}
