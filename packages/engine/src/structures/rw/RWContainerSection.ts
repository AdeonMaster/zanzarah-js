import { RWSection } from './RWSection.ts'

export abstract class RWContainerSection extends RWSection {
  override get isContainer(): boolean {
    return true
  }
}
