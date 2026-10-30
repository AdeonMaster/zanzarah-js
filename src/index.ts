import fs from 'node:fs'
import { ZBinaryReader } from './utils/ZBinaryReader.ts'
import { Scene } from './zengine/scn/Scene.ts'

const pathToFile = `E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sd_1000.scn`
const buffer = fs.readFileSync(pathToFile)
const reader = new ZBinaryReader(buffer)
const scn = Scene.read(reader)

console.log(scn)

// const pathToFile = 'dump\\RESOURCES\\MODELS\\ACTORSEX\\00AST.SKA'
// const buffer = fs.readFileSync(pathToFile)
// const reader = new BinaryReader(buffer)
// const aed = SkeletalAnimation.read(reader)

// console.dir(aed, { depth: null })

// const pathToFile = 'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Models\\ActorsEx\\a000sa00.aed'
// const buffer = fs.readFileSync(pathToFile)
// const reader = new BinaryReader(buffer)
// const aed = ActorExDescription.read(reader)

// console.dir(aed, { depth: null })

// const pathToFile2 = 'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Data\\_fb0x06.fbs'
// const buffer2 = fs.readFileSync(pathToFile2)
// const reader2 = new BinaryReader(buffer2)
// const fbs2 = Table.read(reader2)

// // console.log(fbs1)
// console.dir(fbs2, { depth: null })

// const pathToSave = 'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Save\\_0000.dat'

// const buffer = fs.readFileSync(pathToSave)
// const reader = new BinaryReader(buffer)
// const sg = Savegame.read(reader)

// const len1 = buffer.length

// const writer = new BinaryWriter()
// sg.write(writer)
// const buffer2 = writer.toBuffer()
// const len2 = buffer2.length
// fs.writeFileSync('test.dat', buffer2)

// console.log(len1)
// console.log(len2)

// console.log(sg)

// import { PAKArchive } from "./tools/zpack/index.ts"

// const pathToArchive = 'E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\DATA_0.PAK'
// const pak = new PAKArchive()
// pak.open(pathToArchive)
// pak.unpack("dump")
// // pak.pack("dump", "test", "out")
