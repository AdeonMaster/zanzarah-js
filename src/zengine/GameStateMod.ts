import type { BinaryReader } from "../utils/BinaryReader.ts";
import type { BinaryWriter } from "../utils/BinaryWriter.ts";

export const GameStateModType = {
  DisableAttackTrigger: 0,
  RemoveItem: 1,
  ChangeNPCState: 2,
  DisableTrigger: 3,
  RemoveModel: 4,
  SetTrigger: 5,
  SetNPCModifier: 6
}

export class GSModDisableAttackTrigger {
  triggerId: number

  constructor(triggerId: number) {
    this.triggerId = triggerId
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: BinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModRemoveItem {
  modelId: number

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.modelId)
  }

  constructor(modelId: number) {
    this.modelId = modelId
  }

  static read(handle: BinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModChangeNPCState {
  triggerId: number
  uid: number

  constructor(triggerId: number, uid: number) {
    this.triggerId = triggerId
    this.uid = uid
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.uid)
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: BinaryReader) {
    const uid = handle.readUInt32()
    const triggerId = handle.readUInt32()

    return new this(triggerId, uid)
  }
}

export class GSModDisableTrigger {
  triggerId: number

  constructor(triggerId: number) {
    this.triggerId = triggerId
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.triggerId)
  }

  static read(handle: BinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModRemoveModel {
  modelId: number

  constructor(modelId: number) {
    this.modelId = modelId
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.modelId)
  }

  static read(handle: BinaryReader) {
    return new this(handle.readUInt32())
  }
}

export class GSModSetTrigger {
  triggerId: number
  ii1: number
  ii2: number
  ii3: number
  ii4: number

  constructor(triggerId: number, ii1: number, ii2: number, ii3: number, ii4: number) {
    this.triggerId = triggerId
    this.ii1 = ii1
    this.ii2 = ii2
    this.ii3 = ii3
    this.ii4 = ii4
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.triggerId)
    handle.writeUInt32(this.ii1)
    handle.writeUInt32(this.ii2)
    handle.writeUInt32(this.ii3)
    handle.writeUInt32(this.ii4)
  }

  static read(handle: BinaryReader) {
    return new this(
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32(),
      handle.readUInt32()
    )
  }
}

export class GSModSetNPCModifier {
  triggerId: number
  value: number

  constructor(triggerId: number, value: number) {
    this.triggerId = triggerId
    this.value = value
  }

  write(handle: BinaryWriter) {
    handle.writeUInt32(this.triggerId)
    handle.writeUInt32(this.value)
  }

  static read(handle: BinaryReader) {
    return new this(handle.readUInt32(), handle.readUInt32())
  }
}

export class GameStateMod {
  static read(handle: BinaryReader) {
    const type = handle.readInt32()

    switch(type) {
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
        throw new Error(`GameStateMod.read: Unsupported GameState Modifier: ${type}`)
    }
  }
}
