import type { UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

export class Waypoint {
  id: number = 0
  group: number = 0
  pos: Vector3 = new Vector3()
  walkableIds: number[] = []
  jumpableIds: number[] = []
  visibleIds: number[] = []
}

export class WaypointSystem {
  version: UInt32 = 0
  data: Buffer = Buffer.from(Array(0x18).fill(0))
  waypoints: Waypoint[] = []
  compatibleGroups: Map<number, number[]> = new Map<number, number[]>()

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.version)
    handler.writeUInt32(0)
    if (this.version >= 5) {
      handler.writeBytes(this.data)
    }
    handler.writeUInt32(this.waypoints.length)
    for (let i = 0; i < this.waypoints.length; ++i) {
      const waypoint = this.waypoints[i]
      handler.writeUInt32(waypoint.id)
      if (this.version > 4) {
        handler.writeUInt32(waypoint.group)
      }
      handler.writeVector3(waypoint.pos)

      handler.writeInt32(waypoint.walkableIds.length)
      for (let j = 0; j < waypoint.walkableIds.length; ++j) {
        handler.writeInt32(waypoint.walkableIds[j])
      }

      handler.writeInt32(waypoint.jumpableIds.length)
      for (let j = 0; j < waypoint.jumpableIds.length; ++j) {
        handler.writeInt32(waypoint.jumpableIds[j])
      }
    }
    if (this.version >= 2) {
      handler.writeInt32(this.compatibleGroups.size)
      for (const [groupId, wpIds] of this.compatibleGroups) {
        handler.writeUInt32(groupId)
        for(let i = 0; i < wpIds.length; ++i) {
          handler.writeInt32(wpIds[i])
        }
      }
    }
    if (this.version >= 3) {
      for (let i = 0; i < this.waypoints.length; ++i) {
        handler.writeInt32(this.waypoints[i].visibleIds.length)
        for(let j = 0; j < this.waypoints[i].visibleIds.length; ++j) {
          handler.writeInt32(this.waypoints[i].visibleIds[j])
        }
      }
    }
    handler.writeUInt32(0xffff)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.version = handler.readUInt32()
    if (handler.readUInt32() !== 0)
      throw new Error(
        'WaypointSystem.read: Waypoint system start magic is not correct',
      )

    if (instance.version >= 5) {
      instance.data = handler.readBytes(0x18)
    }
    const count1 = handler.readUInt32()
    instance.waypoints = new Array<Waypoint>(count1)
    for (let i = 0; i < count1; ++i) {
      instance.waypoints[i] = new Waypoint()
      instance.waypoints[i].id = handler.readUInt32()
      if (instance.version > 4) {
        instance.waypoints[i].group = handler.readUInt32()
      }
      instance.waypoints[i].pos = handler.readVector3()

      const walkableIdsLen = handler.readInt32()
      instance.waypoints[i].walkableIds = new Array(walkableIdsLen)
      for(let j = 0; j < walkableIdsLen; ++j) {
        instance.waypoints[i].walkableIds[j] = handler.readInt32()
      }

      const jumpableIdsLen = handler.readInt32()
      instance.waypoints[i].jumpableIds = new Array(jumpableIdsLen)
      for(let j = 0; j < jumpableIdsLen; ++j) {
        instance.waypoints[i].jumpableIds[j] = handler.readInt32()
      }
    }

    if (instance.version >= 2) {
      const groupCount = handler.readInt32()
      for (let i = 0; i < groupCount; ++i) {
        const key = handler.readUInt32()
        const size = handler.readInt32()
        const items = new Array(size)
        for(let j = 0; j < size; ++j) {
          items[j] = handler.readInt32()
        }
        instance.compatibleGroups.set(key, items)
      }
    }

    if (instance.version >= 3) {
      for (let i = 0; i < count1; ++i) {
        const size = handler.readInt32()
        instance.waypoints[i].visibleIds = new Array(size)
        for(let j = 0; j < size; ++j) {
          instance.waypoints[i].visibleIds[j] = handler.readInt32()
        }
      }
    }

    if (handler.readUInt32() !== 0xffff)
      throw new Error(
        'WaypointSystem.read: Waypoint system end magic is not correct',
      )

    return instance
  }
}
