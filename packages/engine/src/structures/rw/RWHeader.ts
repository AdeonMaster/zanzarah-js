export interface RWHeader {
  sectionId: number
  size: number
  version: number
  /** Offset of the chunk header inside its parent's payload */
  offset: number
}
