import fs from 'node:fs'
import path from 'node:path'

import { BinaryReader } from '../../utils/BinaryReader.ts'
import { BinaryWriter } from '../../utils/BinaryWriter.ts'

const listDirFiles = (rootDir: string) => {
  const files: string[] = []

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        files.push(path.relative(rootDir, fullPath))
      }
    }
  }

  walk(rootDir)

  return files
}

type PAKEntry = {
  path: string
  offset: number
  size: number
}

export class PAKArchive {
  public id: number
  public count: number
  public entries: PAKEntry[]
  
  private handle: BinaryReader | null
  private entriesOffset: number

  constructor() {
    this.id = 0
    this.count = 0
    this.entries = []
    this.handle = null
    this.entriesOffset = 0
  }

  open(path: string) {
    this.entries = []

    const buffer = fs.readFileSync(path)
    this.handle = new BinaryReader(buffer)

    this.id = this.handle.readUInt32() //4 bytes
    this.count =  this.handle.readUInt32() //4 bytes

    for(let i = 0; i < this.count; ++i) {
      const pathLength =  this.handle.readUInt32() //4 bytes
      const path =  this.handle.readString(pathLength) //4 * (pathLength * 4) bytes
      const offset =  this.handle.readUInt32() //4 bytes
      const size =  this.handle.readUInt32() //4 bytes

      this.entries.push({
        path,
        offset,
        size
      })
    }

    this.entriesOffset = this.handle.pos()
  }

  unpack(pathToUnpack: string) {
    if (!this.handle) throw new Error("PAK should be opened first")
    if (!fs.existsSync(pathToUnpack)) throw new Error("Path doesn't exists")

    for(let i = 0; i < this.entries.length; ++i) {
      const entry = this.entries[i]

      this.handle.seek(this.entriesOffset + entry.offset)

      // 0x00000101
      const attributes = this.handle.readUInt32()
      const fileBuffer = this.handle.readBytes(entry.size - 4)

      const normalizedFilePath = `${pathToUnpack}/${entry.path.replace(/^\.\.[\\/]/, '')}` 

      fs.mkdirSync(path.dirname(normalizedFilePath), { recursive: true })

      fs.writeFileSync(normalizedFilePath, fileBuffer)

      console.log(`[${i+1}/${this.entries.length}] ${normalizedFilePath}`)
    }
  }

  // pack(pathToFiles: string, name: string, dstPath: string) {
  //   if (!fs.existsSync(pathToFiles)) throw new Error("pathToFiles doesn't exists")
  //   if (!fs.existsSync(dstPath)) throw new Error("dstPath doesn't exists")

  //   const writer = new BinaryWriter()

  //   const files = listDirFiles(pathToFiles)

  //   const buffer1 = Buffer.alloc()
  //   for(let i = 0; i < files.length; ++i) {
  //   }


  //   writer.writeUInt32(0)
  //   writer.writeUInt32(files.length)
  //   for(let i = 0; i < files.length; ++i) {
  //     const path = `..\\${files[i]}`
  //     const fileBuffer = fs.readFileSync(`${pathToFiles}/${files[i]}`)

  //     writer.writeUInt32(path.length)
  //     writer.writeString(path, path.length)
  //     // writer.writeUInt32() //offset?
  //     // writer.writeUInt32() //size?
  //   }
  // }
}
