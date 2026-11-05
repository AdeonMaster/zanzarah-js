import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { RWHeader } from './RWHeader.ts'
import { SectionId } from './SectionID.ts'

export type SectionClass<T extends RWSection = RWSection> = abstract new (
  ...args: any[]
) => T

/**
 * Base class for every RenderWare chunk.
 *
 * The parser attaches a chunk to `parent.children` BEFORE its payload is
 * parsed. That means that while a chunk is being read, all of its earlier
 * siblings (and all of its ancestors' earlier children) are already parsed and
 * reachable through `parent` / `findAncestor` / `findChild`.
 */
export abstract class RWSection {
  readonly header: RWHeader
  readonly parent: RWSection | null
  readonly children: RWSection[] = []

  constructor(header: RWHeader, parent: RWSection | null) {
    this.header = header
    this.parent = parent
  }

  get sectionId(): number {
    return this.header.sectionId
  }

  get sectionName(): string {
    return (
      SectionId[this.header.sectionId] ??
      `Unknown(0x${this.header.sectionId.toString(16)})`
    )
  }

  /** Containers hold a sequence of child chunks; leaves hold raw/structured data. */
  get isContainer(): boolean {
    return false
  }

  /** Parse this chunk's payload. Only called for non-container chunks. */
  read(_reader: ZBinaryReader): void {}

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

  findChildren<T extends RWSection>(type: SectionClass<T>): T[] {
    return this.children.filter((c): c is T => c instanceof type)
  }

  /** Depth-first search through the whole subtree. */
  findAll<T extends RWSection>(type: SectionClass<T>): T[] {
    const out: T[] = []
    for (const c of this.children) {
      if (c instanceof type) out.push(c)
      out.push(...c.findAll(type))
    }
    return out
  }

  dump(depth = 0): string {
    const line = `${'-'.repeat(depth)}${this.sectionName}`
    return [line, ...this.children.map((c) => c.dump(depth + 1))].join('\n')
  }
}

/** A chunk whose payload is a sequence of other chunks. */
export abstract class RWContainerSection extends RWSection {
  override get isContainer(): boolean {
    return true
  }
}
