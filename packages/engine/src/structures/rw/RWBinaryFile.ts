import { ZBinaryReader } from '../../rw.ts'
import type { RWHeader, RWSection, SectionCtor } from './RWSection.ts'
import { SectionId } from './SectionID.ts'
import { RWAnimationPLG } from './sections/RWAnimationPLG.ts'
import { RWAtomic, RWAtomicStruct } from './sections/RWAtomic.ts'
import {
  RWAtomicSection,
  RWAtomicSectionStruct,
} from './sections/RWAtomicSection.ts'
import { RWBinMeshPLG } from './sections/RWBinMeshPLG.ts'
import { RWClampStruct, RWClump } from './sections/RWClump.ts'
import { RWCollisionPLG } from './sections/RWCollisionPLG.ts'
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
import { RWSkinPLG } from './sections/RWSkinPLG.ts'
import { RWString } from './sections/RWString.ts'
import { RWTexture, RWTextureStruct } from './sections/RWTexture.ts'
import { RWTextureDictionary } from './sections/RWTextureDictionary.ts'
import { RWUnknown } from './sections/RWUnknown.ts'
import { RWWorld, RWWorldStruct } from './sections/RWWorld.ts'

const KNOWN_SECTIONS = new Map<number, SectionCtor>([
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
  [SectionId.SkinPLG, RWSkinPLG],
  [SectionId.AnimationPLG, RWAnimationPLG],
  [SectionId.CollisionPLG, RWCollisionPLG],
])

const KNOWN_STRUCTS = new Map<number, SectionCtor>([
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

const createSection = (header: RWHeader, parent: RWSection | null) => {
  const Ctor =
    header.sectionId === SectionId.Struct
      ? KNOWN_STRUCTS.get(parent?.header.sectionId ?? -1)
      : KNOWN_SECTIONS.get(header.sectionId)

  return new (Ctor ?? RWUnknown)(header, parent)
}

const readSection = (
  handler: ZBinaryReader,
  parent: RWSection | null = null,
  depth: number = 0,
) => {
  const children: RWSection[] = []
  if (parent) parent.children = children

  while (handler.pos() < handler.length) {
    const sectionId = handler.readInt32()
    const size = handler.readUInt32()
    const version = handler.readUInt32()

    if (size > handler.length - handler.pos()) {
      console.warn(
        `ERROR: ${SectionId[sectionId]} (0x${sectionId.toString(16)}) declares size ${size}, ending at ${handler.pos() + size}, beyond parent end ${handler.length}`,
      )

      const data = handler.readBytes(handler.length - handler.pos())

      const section = createSection({ sectionId, size, version }, parent)
      children.push(section)

      section.read(new ZBinaryReader(data))

      continue
    }

    const data = handler.readBytes(size)

    const section = createSection({ sectionId, size, version }, parent)
    children.push(section)

    const isContainer = section.isContainer
    if (isContainer) {
      section.children = readSection(
        new ZBinaryReader(data),
        section,
        depth + 1,
      )
    } else {
      section.read(new ZBinaryReader(data))
    }

    if (section instanceof RWUnknown) {
      console.warn(
        `WARNING: Section ${SectionId[sectionId] ?? sectionId} isn't supported by parser`,
      )
    }

    if (depth === 0) {
      const padding = handler.length - handler.pos()
      if (padding > 0) {
        console.warn(
          `WARNING: File has ${padding} trailing byte(s) after the root chunk; ignored`,
        )
        break
      }
    }
  }

  return children
}

export class RWBinaryFile {
  static read(handler: ZBinaryReader) {
    return readSection(handler, null, 0)
  }
}
