import {
  RWAtomicSection,
  RWBinaryFile,
  RWMaterial,
  RWMaterialList,
  RWString,
  RWTexture,
  RWWorld,
  ZBinaryReader,
} from '@zanzarah.js/engine/rw'
import { Buffer } from 'buffer'
import * as THREE from 'three'

const COLOR_MULTIPLIER = 2

interface ColorData {
  r: number
  g: number
  b: number
}

export class BSPLoader extends THREE.Loader<THREE.Group, string> {
  load(
    url: string,
    onLoad: (group: THREE.Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): void {
    const fileLoader = new THREE.FileLoader(this.manager)
      .setPath(this.path)
      .setResponseType('arraybuffer')
      .setWithCredentials(this.withCredentials)
      .setRequestHeader(this.requestHeader)

    fileLoader.load(
      url,
      (data) => {
        try {
          const texturePath =
            this.resourcePath ||
            this.path ||
            THREE.LoaderUtils.extractUrlBase(url)
          onLoad(this.parseBuffer(data as ArrayBuffer, texturePath))
        } catch (error) {
          if (onError) {
            onError(error)
          } else {
            console.error('Failed to parse BSP file:', error)
          }
        }
      },
      onProgress,
      onError,
    )
  }

  parse(data: ArrayBuffer): THREE.Group {
    return this.parseBuffer(data, this.resourcePath || this.path)
  }

  private parseBuffer(data: ArrayBuffer, texturePath: string): THREE.Group {
    const sections = RWBinaryFile.read(new ZBinaryReader(Buffer.from(data)))
    const world = sections.find(
      (section): section is RWWorld => section instanceof RWWorld,
    )

    if (!world) {
      throw new Error('No RenderWare world found in BSP data')
    }

    const textureLoader = new THREE.TextureLoader(this.manager)
      .setPath(texturePath)
      .setCrossOrigin(this.crossOrigin)
    const materials = this.parseMaterials(
      world.findChild(RWMaterialList),
      textureLoader,
    )
    const group = new THREE.Group()

    if (world.struct) {
      const { x, y, z } = world.struct.origin
      group.userData.worldOrigin = { x, y, z }
    }

    for (const sector of world.findAll(RWAtomicSection)) {
      const geometry = this.parseGeometry(sector, materials.length)
      if (!geometry) continue

      group.add(new THREE.Mesh(geometry, materials))
    }

    if (group.children.length === 0) {
      throw new Error('No geometry found in BSP data')
    }

    return group
  }

  private parseMaterials(
    materialList: RWMaterialList | null,
    textureLoader: THREE.TextureLoader,
  ): THREE.MeshBasicMaterial[] {
    const fallbackMaterial = () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
      })

    if (!materialList) return [fallbackMaterial()]

    const definitions = materialList.children.filter(
      (section): section is RWMaterial => section instanceof RWMaterial,
    )
    const materialIndices = materialList.struct?.materialIndices

    if (!materialIndices?.length) {
      return definitions.length
        ? definitions.map((section) =>
            this.parseMaterial(section, textureLoader),
          )
        : [fallbackMaterial()]
    }

    const materials: THREE.MeshBasicMaterial[] = []
    let nextDefinition = 0

    for (const materialIndex of materialIndices) {
      if (materialIndex === -1) {
        const section = definitions[nextDefinition]
        nextDefinition += 1
        materials.push(
          section
            ? this.parseMaterial(section, textureLoader)
            : fallbackMaterial(),
        )
        continue
      }

      materials.push(materials[materialIndex] ?? fallbackMaterial())
    }

    return materials.length ? materials : [fallbackMaterial()]
  }

  private parseMaterial(
    section: RWMaterial,
    textureLoader: THREE.TextureLoader,
  ): THREE.MeshBasicMaterial {
    const colorData = section.struct?.color
    const material = new THREE.MeshBasicMaterial({
      color: colorData ? this.toThreeColor(colorData) : 0xffffff,
      vertexColors: true,
    })
    const textureSection = section.findChild(RWTexture)
    if (!textureSection) return material

    const [colorName, alphaName] = textureSection
      .findChildren(RWString)
      .map((string) => string.value.trim())
    if (colorName) {
      material.map = this.loadTexture(colorName, textureLoader, true)
    }
    if (alphaName) {
      material.alphaMap = this.loadTexture(alphaName, textureLoader, false)
      material.transparent = true
      material.alphaTest = 0.05
    }

    return material
  }

  private loadTexture(
    name: string,
    textureLoader: THREE.TextureLoader,
    isColor: boolean,
  ): THREE.Texture {
    const normalizedName = name.toUpperCase()
    const filename = /\.[A-Z0-9]+$/.test(normalizedName)
      ? normalizedName
      : normalizedName + '.BMP'
    const texture = textureLoader.load(
      filename,
      undefined,
      undefined,
      (error) =>
        console.warn('Failed to load BSP texture ' + filename + ':', error),
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    if (isColor) texture.colorSpace = THREE.SRGBColorSpace

    return texture
  }

  private parseGeometry(
    sector: RWAtomicSection,
    materialCount: number,
  ): THREE.BufferGeometry | null {
    const data = sector.struct
    if (!data || data.vertices.length === 0 || data.triangles.length === 0) {
      return null
    }

    const positions: number[] = []
    const uvs: number[] = []
    const colors: number[] = []

    for (
      let vertexIndex = 0;
      vertexIndex < data.vertices.length;
      vertexIndex++
    ) {
      const vertex = data.vertices[vertexIndex]
      positions.push(vertex.x, vertex.y, vertex.z)

      const uv = data.texCoords1?.[vertexIndex]
      uvs.push(uv?.x ?? 0, uv ? 1 - uv.y : 0)

      const color = data.colors?.[vertexIndex]
      if (color) {
        const converted =
          this.toThreeColor(color).multiplyScalar(COLOR_MULTIPLIER)
        colors.push(converted.r, converted.g, converted.b)
      } else {
        colors.push(1, 1, 1)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const indices: number[] = []
    let currentMaterialIndex: number | null = null
    let groupStart = 0

    for (const triangle of data.triangles) {
      const triangleIndices = [triangle.v1, triangle.v2, triangle.v3]
      for (const index of triangleIndices) {
        if (index >= data.vertices.length) {
          throw new Error(
            'BSP triangle references vertex ' +
              index +
              ', but the sector has ' +
              data.vertices.length +
              ' vertices',
          )
        }
      }

      const materialIndex = data.matIdBase + triangle.m
      const resolvedMaterialIndex =
        materialIndex >= 0 && materialIndex < materialCount ? materialIndex : 0

      if (currentMaterialIndex !== resolvedMaterialIndex) {
        if (currentMaterialIndex !== null) {
          geometry.addGroup(
            groupStart,
            indices.length - groupStart,
            currentMaterialIndex,
          )
        }
        currentMaterialIndex = resolvedMaterialIndex
        groupStart = indices.length
      }

      indices.push(...triangleIndices)
    }

    if (currentMaterialIndex !== null) {
      geometry.addGroup(
        groupStart,
        indices.length - groupStart,
        currentMaterialIndex,
      )
    }

    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  }

  private toThreeColor(color: ColorData): THREE.Color {
    return new THREE.Color().setRGB(
      color.r / 255,
      color.g / 255,
      color.b / 255,
      THREE.SRGBColorSpace,
    )
  }
}

export default BSPLoader
