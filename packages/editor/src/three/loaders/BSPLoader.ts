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
import { getNestedDirectoryHandle, normalizePath } from '../utils/index.js'

const COLOR_MULTIPLIER = 2

interface ColorData {
  r: number
  g: number
  b: number
}

export class BSPLoader extends THREE.Loader<
  THREE.Group,
  FileSystemDirectoryHandle
> {
  load(
    rootHandle: FileSystemDirectoryHandle,
    onLoad: (group: THREE.Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): void
  load(
    rootHandle: FileSystemDirectoryHandle,
    path: string,
    onLoad: (group: THREE.Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): void
  load(
    rootHandle: FileSystemDirectoryHandle,
    pathOrOnLoad: string | ((group: THREE.Group) => void),
    onLoadOrProgress?:
      | ((group: THREE.Group) => void)
      | ((event: ProgressEvent) => void),
    onProgressOrError?:
      | ((event: ProgressEvent) => void)
      | ((error: unknown) => void),
    directOnError?: (error: unknown) => void,
  ): void {
    if (typeof pathOrOnLoad === 'string') {
      this.loadFromDirectory(
        rootHandle,
        pathOrOnLoad,
        onLoadOrProgress as (group: THREE.Group) => void,
        onProgressOrError as ((event: ProgressEvent) => void) | undefined,
        directOnError,
      )
      return
    }

    this.loadFromDirectory(
      rootHandle,
      this.path,
      pathOrOnLoad,
      onLoadOrProgress as ((event: ProgressEvent) => void) | undefined,
      onProgressOrError as ((error: unknown) => void) | undefined,
    )
  }

  loadAsync(
    rootHandle: FileSystemDirectoryHandle,
    onProgress?: (event: ProgressEvent) => void,
  ): Promise<THREE.Group>
  loadAsync(
    rootHandle: FileSystemDirectoryHandle,
    path: string,
    onProgress?: (event: ProgressEvent) => void,
  ): Promise<THREE.Group>
  loadAsync(
    rootHandle: FileSystemDirectoryHandle,
    pathOrProgress?: string | ((event: ProgressEvent) => void),
    directProgress?: (event: ProgressEvent) => void,
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      if (typeof pathOrProgress === 'string') {
        this.load(rootHandle, pathOrProgress, resolve, directProgress, reject)
        return
      }

      this.load(rootHandle, resolve, pathOrProgress, reject)
    })
  }

  private loadFromDirectory(
    rootHandle: FileSystemDirectoryHandle,
    path: string,
    onLoad: (group: THREE.Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
  ): void {
    const normalizedPath = normalizePath(path)
    const pathParts = normalizedPath
      .split('/')
      .filter((part) => part && part !== '.')

    if (pathParts.some((part) => part === '..')) {
      this.reportLoadError(
        new Error(`BSP path must stay within the selected directory: ${path}`),
        onError,
        'Failed to load BSP file:',
      )
      return
    }
    if (pathParts.length === 0) {
      this.reportLoadError(
        new Error('A path to the BSP file is required'),
        onError,
        'Failed to load BSP file:',
      )
      return
    }

    const fileName = pathParts.pop()!
    const directoryPath = pathParts.join('/')
    this.manager.itemStart(normalizedPath)

    void (async () => {
      try {
        const fileDirectory = directoryPath
          ? await getNestedDirectoryHandle(rootHandle, directoryPath)
          : rootHandle
        const fileHandle = await fileDirectory.getFileHandle(fileName)
        const file = await fileHandle.getFile()
        const data = await file.arrayBuffer()
        onProgress?.(
          new ProgressEvent('progress', {
            lengthComputable: true,
            loaded: data.byteLength,
            total: file.size,
          }),
        )

        try {
          const texturesDirHandler = await getNestedDirectoryHandle(
            rootHandle,
            'Resources/Textures/Worlds',
          )

          const group = this.parseBuffer(data, '', texturesDirHandler)
          onLoad(group)
          this.manager.itemEnd(normalizedPath)
        } catch (error) {
          this.manager.itemError(normalizedPath)
          this.manager.itemEnd(normalizedPath)
          this.reportLoadError(error, onError, 'Failed to parse BSP file:')
        }
      } catch (error) {
        this.manager.itemError(normalizedPath)
        this.manager.itemEnd(normalizedPath)
        this.reportLoadError(error, onError, 'Failed to load BSP file:')
      }
    })()
  }

  private reportLoadError(
    error: unknown,
    onError: ((error: unknown) => void) | undefined,
    message: string,
  ): void {
    if (onError) {
      onError(error)
    } else {
      console.error(message, error)
    }
  }

  private parseBuffer(
    data: ArrayBuffer,
    texturePath: string,
    texturesDirHandler: FileSystemDirectoryHandle,
  ): THREE.Group {
    const sections = RWBinaryFile.read(new ZBinaryReader(Buffer.from(data)))
    console.log(sections)

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
      texturesDirHandler,
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
    texturesDirHandler: FileSystemDirectoryHandle,
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
            this.parseMaterial(section, textureLoader, texturesDirHandler),
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
            ? this.parseMaterial(section, textureLoader, texturesDirHandler)
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
    texturesDirHandler: FileSystemDirectoryHandle,
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
      material.map = this.loadTexture(
        colorName,
        textureLoader,
        true,
        texturesDirHandler,
      )
    }
    if (alphaName) {
      material.alphaMap = this.loadTexture(
        alphaName,
        textureLoader,
        false,
        texturesDirHandler,
      )
      material.transparent = true
      material.alphaTest = 0.05
    }

    return material
  }

  private loadTexture(
    name: string,
    textureLoader: THREE.TextureLoader,
    isColor: boolean,
    texturesDirHandler?: FileSystemDirectoryHandle,
  ): THREE.Texture {
    const normalizedName = name.toUpperCase()
    const filename = /\.[A-Z0-9]+$/.test(normalizedName)
      ? normalizedName
      : `${normalizedName}.BMP`
    const texture = texturesDirHandler
      ? new THREE.Texture()
      : textureLoader.load(filename, undefined, undefined, (error) =>
          console.warn(`Failed to load BSP texture ${filename}:${error}`),
        )

    if (texturesDirHandler) {
      this.loadTextureFromDirectory(filename, texturesDirHandler, texture)
    }

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    if (isColor) texture.colorSpace = THREE.SRGBColorSpace

    return texture
  }

  private loadTextureFromDirectory(
    path: string,
    texturesDirHandler: FileSystemDirectoryHandle,
    texture: THREE.Texture,
  ): void {
    const normalizedPath = path.replaceAll('\\', '/')
    const pathParts = normalizedPath
      .split('/')
      .filter((part) => part && part !== '.')
    if (pathParts.some((part) => part === '..') || pathParts.length === 0) {
      console.warn(`Failed to load BSP texture ${path}: invalid texture path`)
      return
    }

    const fileName = pathParts.pop()!
    this.manager.itemStart(path)

    void (async () => {
      let objectUrl: string | undefined
      try {
        const fileHandle = await texturesDirHandler.getFileHandle(fileName)
        const file = await fileHandle.getFile()
        objectUrl = URL.createObjectURL(file)

        const imageLoader = new THREE.ImageLoader(this.manager).setCrossOrigin(
          this.crossOrigin,
        )
        imageLoader.load(
          objectUrl,
          (image) => {
            texture.image = image
            texture.needsUpdate = true
            URL.revokeObjectURL(objectUrl!)
            this.manager.itemEnd(path)
          },
          undefined,
          (error) => {
            URL.revokeObjectURL(objectUrl!)
            this.manager.itemError(path)
            this.manager.itemEnd(path)
            console.warn(`Failed to load BSP texture ${path}:`, error)
          },
        )
      } catch (error) {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        this.manager.itemError(path)
        this.manager.itemEnd(path)
        console.warn(`Failed to load BSP texture ${path}:`, error)
      }
    })()
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
