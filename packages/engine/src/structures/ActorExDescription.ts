// https://github.com/Helco/zzio/blob/master/zzio/ActorExDescription.cs
import type { Int32 } from '../types.ts'
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class ActorPartDescription {
  model: string = ''
  animationPoolID: Int32 = -1
  animations: [Int32, string][] = []

  write(handler: ZBinaryWriter, partName: string) {
    handler.writeZString(`[ModelFilename_${partName}]`)
    handler.writeZString(this.model)
    handler.writeZString(`[AnimationPoolID_${partName}]`)
    handler.writeInt32(this.animationPoolID)
    for (const [type, fileName] of this.animations) {
      handler.writeZString(`[AnimationFilename_${partName}]`)
      handler.writeZString(fileName)
      handler.writeInt32(type)
    }
  }
}

export class ActorExDescription {
  body: ActorPartDescription = new ActorPartDescription()
  wings: ActorPartDescription = new ActorPartDescription()
  attachWingsToBone: Int32 = -1
  headBoneID: Int32 = -1
  effectBoneID: Int32 = -1

  write(handler: ZBinaryWriter) {
    handler.writeZString('[ActorExDescriptionFile]')
    this.body.write(handler, 'Body')
    if (this.wings.model.length > 0) {
      this.wings.write(handler, 'Wings')
    }
    handler.writeZString('[AttachWingsToBone]')
    handler.writeInt32(this.attachWingsToBone)
    handler.writeZString('[HeadBoneID]')
    handler.writeInt32(this.headBoneID)
    handler.writeZString('[EffectBoneID]')
    handler.writeInt32(this.effectBoneID)
    handler.writeZString('[EOS]')
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    const mainSectionName = handler.readZString()
    if (mainSectionName !== '[ActorExDescriptionFile]')
      throw new Error(
        'ActorExDescription.read: Not an actorex description file',
      )

    const bodyAnimations: [Int32, string][] = []
    const wingsAnimations: [Int32, string][] = []

    let stopParsing = false
    while (!stopParsing) {
      const sectionName = handler.readZString()

      switch (sectionName) {
        case '[ModelFilename_Body]': {
          instance.body.model = handler.readZString()
          break
        }
        case '[AnimationPoolID_Body]': {
          instance.body.animationPoolID = handler.readInt32()
          break
        }
        case '[AnimationFilename_Body]': {
          const name = handler.readZString()
          const type = handler.readInt32()

          bodyAnimations.push([type, name])
          break
        }
        case '[ModelFilename_Wings]': {
          instance.wings.model = handler.readZString()
          break
        }
        case '[AnimationPoolID_Wings]': {
          instance.wings.animationPoolID = handler.readInt32()
          break
        }
        case '[AnimationFilename_Wings]': {
          const name = handler.readZString()
          const type = handler.readInt32()

          wingsAnimations.push([type, name])
          break
        }
        case '[AttachWingsToBone]': {
          instance.attachWingsToBone = handler.readInt32()
          break
        }
        case '[HeadBoneID]': {
          instance.headBoneID = handler.readInt32()
          break
        }
        case '[EffectBoneID]': {
          instance.effectBoneID = handler.readInt32()
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

    instance.body.animations = [...instance.body.animations, ...bodyAnimations]
    instance.wings.animations = [
      ...instance.wings.animations,
      ...wingsAnimations,
    ]

    return instance
  }
}
