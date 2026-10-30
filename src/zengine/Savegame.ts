import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'
import {
  GameStateMod,
  type GSModChangeNPCState,
  type GSModDisableAttackTrigger,
  type GSModDisableTrigger,
  type GSModRemoveItem,
  type GSModRemoveModel,
  type GSModSetNPCModifier,
  type GSModSetTrigger,
} from './GameStateMod.ts'
import { InventoryCard } from './InventoryCard.ts'
import { Version } from './Version.ts'

export class Savegame {
  version: Version

  name: string
  secondsPlayed: number
  progress: number
  sceneId: number
  entryId: number

  scenes: {
    name: string
    mods: (
      | GSModDisableAttackTrigger
      | GSModRemoveItem
      | GSModChangeNPCState
      | GSModDisableTrigger
      | GSModRemoveModel
      | GSModSetTrigger
      | GSModSetNPCModifier
    )[]
  }[]

  items: InventoryCard[]

  pixiesHolding: number
  pixiesCatched: number

  globalVars: [number, number][]

  switchGameMinMoves: number

  constructor() {
    this.version = new Version()

    this.name = ''
    this.secondsPlayed = 0
    this.progress = 0
    this.sceneId = 0
    this.entryId = 0

    this.scenes = []

    this.items = []

    this.pixiesHolding = 0
    this.pixiesCatched = 0

    this.globalVars = []

    this.switchGameMinMoves = 9999
  }

  write(handler: ZBinaryWriter) {
    this.version.write(handler)

    handler.writeZString(this.name)
    handler.writeInt32(this.secondsPlayed)
    handler.writeInt32(this.progress)

    handler.writeUInt32(8)
    handler.writeInt32(this.sceneId)
    handler.writeInt32(this.sceneId)

    handler.writeUInt32(this.scenes.length)
    for (let i = 0; i < this.scenes.length; ++i) {
      const scene = this.scenes[i]

      handler.writeZString(scene.name)
      handler.writeInt32(scene.mods.length)
      for (let j = 0; j < scene.mods.length; ++j) {
        scene.mods[j].write(handler)
      }
    }

    handler.writeUInt32(this.items.length)
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].write(handler)
    }

    handler.writeUInt32(this.pixiesHolding)
    handler.writeUInt32(this.pixiesHolding)

    handler.writeInt32(49)
    for (let i = 0; i < 49; ++i) {
      const globalVar = this.globalVars[i]

      handler.writeUInt32(globalVar[0])
      handler.writeUInt32(globalVar[1])
    }

    handler.writeUInt32(this.switchGameMinMoves)
  }

  static read(handler: ZBinaryReader) {
    const version = Version.read(handler)

    const nameLen = handler.readUInt32()
    const name = handler.readString(nameLen)
    const secondsPlayed = handler.readInt32()
    const progress = handler.readInt32()

    if (handler.readUInt32() !== 8)
      throw new Error('Savegame.read: Location error')
    const sceneId = handler.readInt32()
    const entryId = handler.readInt32()
    const sceneCount = handler.readUInt32()
    const scenes = new Array(sceneCount)
    for (let i = 0; i < sceneCount; ++i) {
      const sceneName = handler.readZString()
      const modCount = handler.readInt32()
      const mods = new Array(modCount)

      for (let j = 0; j < modCount; ++j) {
        mods[j] = GameStateMod.read(handler)
      }

      scenes[i] = {
        name: sceneName,
        mods,
      }
    }
    const itemCount = handler.readUInt32()
    const items = new Array(itemCount)
    for (let i = 0; i < itemCount; ++i) {
      items[i] = InventoryCard.read(handler)
    }
    const pixiesHolding = handler.readUInt32()
    const pixiesCatched = handler.readUInt32()
    if (handler.readInt32() !== 49)
      throw new Error('Savegame.read: Invalid global variable count')
    const globalVars = new Array(49)
    for (let i = 0; i < 49; ++i) {
      const changeCount = handler.readUInt32()
      const value = handler.readUInt32()

      globalVars[i] = [changeCount, value]
    }
    const switchGameMinMoves = handler.readUInt32()

    const sg = new this()
    sg.version = version

    sg.name = name
    sg.secondsPlayed = secondsPlayed
    sg.progress = progress
    sg.sceneId = sceneId
    sg.entryId = entryId

    sg.scenes = scenes

    sg.items = items

    sg.pixiesHolding = pixiesHolding
    sg.pixiesCatched = pixiesCatched

    sg.globalVars = globalVars

    sg.switchGameMinMoves = switchGameMinMoves

    return sg
  }
}
