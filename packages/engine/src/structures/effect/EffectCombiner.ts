import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

// https://github.com/Helco/zzio/blob/master/zzio/effect/EffectCombiner.cs
export class EffectCombiner {
  description: string = ''
  isLooping: boolean = false
  upwards: Vector3 = new Vector3()
  forwards: Vector3 = new Vector3()
  position: Vector3 = new Vector3()
  parts: any[] = []

  write(handler: ZBinaryWriter) {
    throw new Error('EffectCombiner.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const magicSection = handler.readZString()
    if (magicSection !== '[Effect Combiner]')
      throw new Error(
        'EffectCombiner.read: File does not start with correct tag',
      )

    const instance = new this()

    let shouldParse = true
    while (shouldParse) {
      const sectionName = handler.readZString()

      switch (sectionName) {
        case '[EOF]':
          shouldParse = false
          break
        case '[Effect_Combiner_Description]':
          instance.description = handler.readString(32)
          break
        case '[Effect_Combiner_Parameter]':
          handler.readInt32() // padding, unused?
          instance.isLooping = handler.readBool()
          break
        case '[Effect_Combiner_Position]':
          handler.readBytes(24) // padding, unused?
          break
        case '[Effect_Combiner_Form]':
          instance.upwards = handler.readVector3()
          instance.forwards = handler.readVector3()
          instance.position = handler.readVector3()
          break
        default:
          throw new Error(
            `EffectCombiner: Invalid section name: "${sectionName}"`,
          )
      }
    }

    return instance
  }
}
