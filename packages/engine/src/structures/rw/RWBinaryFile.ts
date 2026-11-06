import { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { RWHeader } from './RWHeader.ts'
import type { RWSection } from './RWSection.ts'
import { SectionId } from './SectionID.ts'
import { RWAtomic, RWAtomicStruct } from './sections/RWAtomic.ts'
import {
  RWAtomicSection,
  RWAtomicSectionStruct,
} from './sections/RWAtomicSection.ts'
import { RWBinMeshPLG } from './sections/RWBinMeshPLG.ts'
import { RWClampStruct, RWClump } from './sections/RWClump.ts'
import { RWExtension } from './sections/RWExtension.ts'
import { RWFrameList, RWFrameListStruct } from './sections/RWFrameList.ts'
import { RWGeometry, RWGeometryStruct } from './sections/RWGeometry.ts'
import {
  RWGeometryList,
  RWGeometryListStruct,
} from './sections/RWGeometryList.ts'
import { RWMaterial, RWMaterialStruct } from './sections/RWMaterial.ts'
import {
  RWMaterialList,
  RWMaterialListStruct,
} from './sections/RWMaterialList.ts'
import { RWMorphPLG } from './sections/RWMorphPLG.ts'
import {
  RWPlaneSection,
  RWPlaneSectionStruct,
} from './sections/RWPlaneSection.ts'
import { RWString } from './sections/RWString.ts'
import { RWTexture, RWTextureStruct } from './sections/RWTexture.ts'
import { RWTextureDictionary } from './sections/RWTextureDictionary.ts'
import { RWUnknown } from './sections/RWUnknown.ts'
import { RWWorld, RWWorldStruct } from './sections/RWWorld.ts'

type ChunkCtor = new (header: RWHeader, parent: RWSection | null) => RWSection

/** Section id -> class (for everything except Struct). */
const CHUNK_CLASSES = new Map<number, ChunkCtor>([
  [SectionId.Extension, RWExtension],
  [SectionId.Texture, RWTexture],
  [SectionId.Material, RWMaterial],
  [SectionId.MaterialList, RWMaterialList],
  [SectionId.FrameList, RWFrameList],
  [SectionId.Geometry, RWGeometry],
  [SectionId.Clump, RWClump],
  [SectionId.Atomic, RWAtomic],
  [SectionId.TextureDictionary, RWTextureDictionary],
  [SectionId.GeometryList, RWGeometryList],
  [SectionId.World, RWWorld],
  [SectionId.PlaneSection, RWPlaneSection], // 0x0A - add to SectionId if missing
  [SectionId.AtomicSection, RWAtomicSection],
  [SectionId.String, RWString],
  [SectionId.BinMeshPLG, RWBinMeshPLG],
  [SectionId.MorphPLG, RWMorphPLG],
])

/** A Struct's layout depends on its parent: parent section id -> struct class. */
const STRUCT_CLASSES = new Map<number, ChunkCtor>([
  [SectionId.World, RWWorldStruct],
  [SectionId.MaterialList, RWMaterialListStruct],
  [SectionId.Material, RWMaterialStruct],
  [SectionId.Texture, RWTextureStruct],
  [SectionId.PlaneSection, RWPlaneSectionStruct],
  [SectionId.Atomic, RWAtomicStruct],
  [SectionId.AtomicSection, RWAtomicSectionStruct],
  [SectionId.Clump, RWClampStruct],
  [SectionId.FrameList, RWFrameListStruct],
  [SectionId.GeometryList, RWGeometryListStruct],
  [SectionId.Geometry, RWGeometryStruct],
])

const createSection = (
  header: RWHeader,
  parent: RWSection | null,
): RWSection => {
  const Ctor =
    header.sectionId === SectionId.Struct
      ? STRUCT_CLASSES.get(parent?.sectionId ?? -1)
      : CHUNK_CLASSES.get(header.sectionId)

  return new (Ctor ?? RWUnknown)(header, parent)
}

export interface ReadOptions {
  /** Called for non-fatal problems (unknown chunks, unread trailing bytes). */
  onWarn?: (message: string) => void
}

const parseChunks = (
  handler: ZBinaryReader,
  parent: RWSection | null,
  options: ReadOptions,
): RWSection[] => {
  // Write straight into the parent's children so that chunks are visible in
  // the tree while their later siblings / descendants are still being parsed.
  const out: RWSection[] = parent ? parent.children : []

  while (handler.pos() < handler.length) {
    const offset = handler.pos()
    const remaining = handler.length - offset

    if (remaining < 4) {
      throw new Error(`Incomplete section ID at offset ${offset}`)
    }

    const sectionId = handler.readInt32()
    if (sectionId === SectionId.EOF) break

    if (remaining < 12) {
      throw new Error(
        `Incomplete section header at offset ${offset}: ${remaining} bytes remain`,
      )
    }

    const size = handler.readUInt32()
    const version = handler.readUInt32()

    console.log(SectionId[sectionId])
    if (size > handler.length - handler.pos()) {
      throw new Error(
        `Section ${SectionId[sectionId] ?? sectionId} at offset ${offset} declares ${size} data bytes, ` +
          `but only ${handler.length - handler.pos()} remain`,
      )
    }

    const chunk = createSection({ sectionId, size, version, offset }, parent)
    out.push(chunk) // attach BEFORE parsing the payload

    const reader = new ZBinaryReader(handler.readBytes(size))

    if (chunk.isContainer) {
      parseChunks(reader, chunk, options)
    } else {
      chunk.read(reader)

      if (chunk instanceof RWUnknown) {
        options.onWarn?.(
          `Unparsed section ${chunk.sectionName} at offset ${offset}`,
        )
      } else if (reader.pos() !== reader.length) {
        options.onWarn?.(
          `${chunk.sectionName} at offset ${offset}: ${reader.length - reader.pos()} trailing bytes not consumed`,
        )
      }
    }
  }

  return out
}

export class RWBinaryFile {
  static read(handler: ZBinaryReader, options: ReadOptions = {}): RWSection[] {
    return parseChunks(handler, null, options)
  }

  /** Pretty-print the chunk tree. */
  static dump(chunks: RWSection[]): string {
    return chunks.map((c) => c.dump()).join('\n')
  }
}
