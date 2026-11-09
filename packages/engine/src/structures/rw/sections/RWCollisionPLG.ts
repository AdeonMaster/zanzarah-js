import type { ZBinaryReader } from '../../../rw.ts'
import type { Float, Int32, UInt16 } from '../../../types.ts'
import type { ZBinaryWriter } from '../../../utils/ZBinaryWriter.ts'
import { RWSection } from '../RWSection.ts'

export enum CollisionSectorType {
  X = 0,
  Y = 4,
  Z = 8,
}

export class CollisionSector {
  type: CollisionSectorType = 0
  value: Float = 0.0
  index: UInt16 = 0
  count: UInt16 = 0
}

export class CollisionSplit {
  right: CollisionSector = new CollisionSector()
  left: CollisionSector = new CollisionSector()
}

export class RWCollisionPLG extends RWSection {
  splits: CollisionSplit[] = []
  map: Int32[] = []

  override write(_handler: ZBinaryWriter) {
    throw new Error('RWCollisionPLG.read: Not implemented yet')
  }

  override read(handler: ZBinaryReader) {
    const collisionSplitCount = handler.readInt32() - 1
    const mapCount = handler.readInt32()

    this.splits = new Array(collisionSplitCount)
    this.map = new Array(mapCount)

    for (let i = 0; i < collisionSplitCount; ++i) {
      const types = handler.readUInt32()
      this.splits[i] = new CollisionSplit()
      this.splits[i].right.index = handler.readUInt16()
      this.splits[i].left.index = handler.readUInt16()
      this.splits[i].left.value = handler.readFloat()
      this.splits[i].right.value = handler.readFloat()

      this.splits[i].right.type = types >> 16
      this.splits[i].left.type = this.splits[i].right.type
      this.splits[i].right.count = ((types >> 0) & 0xff) === 2 ? -1 : 0
      this.splits[i].left.count = ((types >> 8) & 0xff) === 2 ? -1 : 0
    }

    if (this.splits.length > 0) {
      const stack: [number, boolean][] = []
      stack.push([0, true])
      stack.push([0, false])
      while (stack.length > 0) {
        const [splitI, isRight] = stack.pop()!
        const cur = isRight
          ? this.splits[splitI].right
          : this.splits[splitI].right
        if (cur.count === -1) {
          stack.push([cur.index, true])
          stack.push([cur.index, false])
          continue
        }

        cur.index = handler.readUInt16()
        cur.count = handler.readUInt16()
      }
    }

    for (let i = 0; i < mapCount; ++i) {
      this.map[i] = handler.readInt32()
    }
  }
}
