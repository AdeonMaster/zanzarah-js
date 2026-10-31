import fs from 'node:fs'
import {
  Savegame,
  Scene,
  ZBinaryReader,
  ZBinaryWriter,
} from '@zanzarah.js/engine'

// const pathToSave =
//   'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Save\\_0000.dat'
// const buffer = fs.readFileSync(pathToSave)
// const reader = new ZBinaryReader(buffer)
// const sg = Savegame.read(reader)

// console.log(sg)

const pathToFile = `E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sc_2421.scn`
const buffer = fs.readFileSync(pathToFile)
const reader = new ZBinaryReader(buffer)
const scn = Scene.read(reader)
console.log(scn)

const writer = new ZBinaryWriter()
scn.write(writer)
