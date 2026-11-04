import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export enum GameStateModType {
  DisableAttackTrigger,
  RemoveItem,
  ChangeNPCState,
  DisableTrigger,
  RemoveModel,
  SetTrigger,
  SetNPCModifier
}

export class GSModDisableAttackTrigger {
  type: GameStateModType = GameStateModType.DisableAttackTrigger
  triggerId: number = 0

  constructor(triggerId: number) {
    this.triggerId = triggerId
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: ZBinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModRemoveItem {
  type: GameStateModType = GameStateModType.RemoveItem
  modelId: number = 0

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.modelId)
  }

  constructor(modelId: number) {
    this.modelId = modelId
  }

  static read(handle: ZBinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModChangeNPCState {
  type: GameStateModType = GameStateModType.ChangeNPCState
  triggerId: number = 0
  uid: number = 0

  constructor(triggerId: number, uid: number) {
    this.triggerId = triggerId
    this.uid = uid
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.uid)
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: ZBinaryReader) {
    const uid = handle.readUInt32()
    const triggerId = handle.readUInt32()

    return new this(triggerId, uid)
  }
}

export class GSModDisableTrigger {
  type: GameStateModType = GameStateModType.DisableTrigger
  triggerId: number = 0

  constructor(triggerId: number) {
    this.triggerId = triggerId
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: ZBinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModRemoveModel {
  type: GameStateModType = GameStateModType.RemoveModel
  modelId: number = 0

  constructor(modelId: number) {
    this.modelId = modelId
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.modelId)
  }

  static read(handle: ZBinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModSetTrigger {
  type: GameStateModType = GameStateModType.SetTrigger
  triggerId: number
  ii1: number
  ii2: number
  ii3: number
  ii4: number

  constructor(
    triggerId: number,
    ii1: number,
    ii2: number,
    ii3: number,
    ii4: number,
  ) {
    this.triggerId = triggerId
    this.ii1 = ii1
    this.ii2 = ii2
    this.ii3 = ii3
    this.ii4 = ii4
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.triggerId)
    handle.writeUInt32(this.ii1)
    handle.writeUInt32(this.ii2)
    handle.writeUInt32(this.ii3)
    handle.writeUInt32(this.ii4)
  }

  static read(handle: ZBinaryReader) {
    return new this(
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32(),
    )
  }
}

export class GSModSetNPCModifier {
  type: GameStateModType = GameStateModType.SetNPCModifier
  triggerId: number = 0
  value: number = 0

  constructor(triggerId: number, value: number) {
    this.triggerId = triggerId
    this.value = value
  }

  write(handle: ZBinaryWriter) {
    handle.writeInt32(this.type)
    handle.writeUInt32(this.triggerId)
    handle.writeUInt32(this.value)
  }

  static read(handle: ZBinaryReader) {
    return new this(handle.readUInt32(), handle.readUInt32())
  }
}

export class GameStateMod {
  static read(handle: ZBinaryReader) {
    const type = handle.readInt32()

    switch (type) {
      case GameStateModType.DisableAttackTrigger:
        return GSModDisableAttackTrigger.read(handle)
      case GameStateModType.RemoveItem:
        return GSModRemoveItem.read(handle)
      case GameStateModType.ChangeNPCState:
        return GSModChangeNPCState.read(handle)
      case GameStateModType.DisableTrigger:
        return GSModDisableTrigger.read(handle)
      case GameStateModType.RemoveModel:
        return GSModRemoveModel.read(handle)
      case GameStateModType.SetTrigger:
        return GSModSetTrigger.read(handle)
      case GameStateModType.SetNPCModifier:
        return GSModSetNPCModifier.read(handle)
      default:
        throw new Error(
          `GameStateMod.read: Unsupported GameState Modifier: ${type}`,
        )
    }
  }
}
