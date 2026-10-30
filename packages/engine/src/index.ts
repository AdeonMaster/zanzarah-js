export { BSP } from './structures/bsp/BSP.ts'
export { PAKArchive, type PAKArchiveEntry } from './structures/PAKArchive.ts'
export { Savegame } from './structures/Savegame.ts'
export { BinaryReader } from './utils/BinaryReader.ts'
export { BinaryWriter } from './utils/BinaryWriter.ts'
export { ZBinaryReader } from './utils/ZBinaryReader.ts'
export { ZBinaryWriter } from './utils/ZBinaryWriter.ts'

// const pathToFile = `dump\\RESOURCES\\WORLDS\\DUMMY.BSP`
// const buffer = fs.readFileSync(pathToFile)
// const reader = new ZBinaryReader(buffer)
// const bsp = BSP.read(reader)
// console.log(bsp)

// const pathToFile = `E:\\SteamLibrary\\steamapps\\common\\ZanZarah\\Resources\\Worlds\\sd_1000.scn`
// const buffer = fs.readFileSync(pathToFile)
// const reader = new ZBinaryReader(buffer)
// const scn = Scene.read(reader)
// console.log(scn)

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
// const reader = new ZBinaryReader(buffer)
// const sg = Savegame.read(reader)

// const len1 = buffer.length

// const writer = new ZBinaryWriter()
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

// const writer = new ZBinaryWriter()
// writer.writeZString("Hello world!")
// writer.writeUInt32(333)
// writer.writeBool(true)
// writer.writeBytes(Buffer.from([0x0, 0x1, 0x2, 0x3]))
// writer.writeUInt8(255)

// fs.writeFileSync("adeon.bin", writer.toBuffer())

// class AdeonStruct {
//   unk1: string
//   unk2: number
//   unk3: boolean
//   unk4: Buffer
//   unk5: number

//   constructor() {
//     this.unk1 = ''
//     this.unk2 = 0
//     this.unk3 = false
//     this.unk4 = Buffer.from([0, 0, 0, 0])
//     this.unk5 = 0
//   }

//   static read(handler: ZBinaryReader) {
//     const instance = new this()

//     instance.unk1 = handler.readZString()
//     instance.unk2 = handler.readUInt32()
//     instance.unk3 = handler.readBool()
//     instance.unk4 = handler.readBytes(4)
//     instance.unk5 = handler.readUInt8()

//     return instance
//   }
// }

// const buffer = fs.readFileSync("adeon.bin")
// const reader = new ZBinaryReader(buffer)
// const adeon = AdeonStruct.read(reader)

// class Field {
//   offset: number
//   value: any
//   size: number

//   constructor() {
//     this.offset = 0
//     this.value = null
//     this.size = 0
//   }

//   static read(handler: BinaryReader, reader) {
//     const instance = new this()

//     instance.offset = handler.pos()
//     instance.value =

//     return instance
//   }
// }

// console.log(adeon)

// const buffer = fs.readFileSync(pathToSave)
// const reader = new ZBinaryReader(buffer)
// const sg = Savegame.read(reader)

// const len1 = buffer.length

// const writer = new ZBinaryWriter()
// sg.write(writer)
// const buffer2 = writer.toBuffer()
// const len2 = buffer2.length
// fs.writeFileSync('test.dat', buffer2)

// console.log(len1)
// console.log(len2)
