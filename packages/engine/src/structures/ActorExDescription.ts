// https://github.com/Helco/zzio/blob/master/zzio/ActorExDescription.cs
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class ActorPartDescription {
  model: string = ''
  animationPoolID: number = -1
  animations: [number, string][] = []

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
  attachWingsToBone: number = -1
  headBoneID: number = -1
  effectBoneID: number = -1

  write(handler: ZBinaryWriter) {
    handler.writeZString("[ActorExDescriptionFile]")
    this.body.write(handler, "Body")
    if (this.wings.model.length > 0) {
      this.wings.write(handler, "Wings")
    }
    handler.writeZString("[AttachWingsToBone]")
    handler.writeInt32(this.attachWingsToBone)
    handler.writeZString("[HeadBoneID]")
    handler.writeInt32(this.headBoneID)
    handler.writeZString("[EffectBoneID]")
    handler.writeInt32(this.effectBoneID)
    handler.writeZString("[EOS]")
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    const mainSectionName = handler.readZString()
    if (mainSectionName !== '[ActorExDescriptionFile]')
      throw new Error(
        'ActorExDescription.read: Not an actorex description file',
      )

    const bodyAnimations: [number, string][] = []
    const wingsAnimations: [number, string][] = []

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
    instance.wings.animations = [...instance.wings.animations, ...wingsAnimations]

    return instance
  }
}
