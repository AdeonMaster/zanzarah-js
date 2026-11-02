import fs from 'node:fs'
import {
  Scene,
  BSP,
  ZBinaryReader,
  ZBinaryWriter,
} from '@zanzarah.js/engine'
import { IColor } from '../../engine/src/structures/IColor.ts'

// const pathToSave =
//   'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Save\\_0000.dat'
// const buffer = fs.readFileSync(pathToSave)
// const reader = new ZBinaryReader(buffer)
// const sg = Savegame.read(reader)

// console.log(sg)

// const pathToFile = `E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sc_2421.scn`
// const buffer = fs.readFileSync(pathToFile)
// const reader = new ZBinaryReader(buffer)
// const scn = Scene.read(reader)
// console.log(scn)

// const writer = new ZBinaryWriter()
// scn.write(writer)

const loadScn = (path: string) => {
  const buffer = fs.readFileSync(path)
  const reader = new ZBinaryReader(buffer)
  const scn = Scene.read(reader)

  return scn
}

const saveScn = (scn: Scene, path: string) => {
  const writer = new ZBinaryWriter()
  scn.write(writer)
  const buffer = writer.toBuffer()
  fs.writeFileSync(path, buffer)
}

const scn1 = loadScn(`E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sc_2421.scn`)
scn1.lights[0].color.r = 1.0
scn1.lights[0].color.g = 0.0
scn1.lights[0].color.b = 0.0
scn1.lights[1].color.r = 1.0
scn1.lights[1].color.g = 0.0
scn1.lights[1].color.b = 0.0

saveScn(scn1, `E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sc_2421.scn`)
// const scn2 = loadScn('tmp.scn')
