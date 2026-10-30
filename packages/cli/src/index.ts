import fs from 'node:fs'
import { Savegame, ZBinaryReader } from '@zanzarah.js/engine'

const pathToSave =
  'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Save\\_0000.dat'
const buffer = fs.readFileSync(pathToSave)
const reader = new ZBinaryReader(buffer)
const sg = Savegame.read(reader)

console.log(sg)
