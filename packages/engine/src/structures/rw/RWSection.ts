import type { ZBinaryReader } from '../../rw.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { SectionId } from '../rw/SectionID.ts'

export type RWHeader = {
  sectionId: number
  size: number
  version: number
}

export type SectionClass<T extends RWSection = RWSection> = abstract new (
  ...args: any[]
) => T

export type SectionCtor = new (
  header: RWHeader,
  parent: RWSection | null,
) => RWSection

export abstract class RWSection {
  header: RWHeader
  parent: RWSection | null
  children: RWSection[]

  constructor(header: RWHeader, parent: RWSection | null) {
    this.header = header
    this.parent = parent
    this.children = []
  }

  get isContainer(): boolean {
    return false
  }

  write(_handler: ZBinaryWriter) {}

  read(_handler: ZBinaryReader) {}

  findAncestor<T extends RWSection>(type: SectionClass<T>): T | null {
    for (let p = this.parent; p; p = p.parent) {
      if (p instanceof type) return p
    }
    return null
  }

  findChild<T extends RWSection>(type: SectionClass<T>): T | null {
    for (const c of this.children) {
      if (c instanceof type) return c
    }
    return null
  }

  dump(depth = 0): string {
    const line = `${'-'.repeat(depth)} ${SectionId[this.header.sectionId] ?? this.header.sectionId} (${this.header.size} bytes)`
    return [line, ...this.children.map((c) => c.dump(depth + 1))].join('\n')
  }
}
