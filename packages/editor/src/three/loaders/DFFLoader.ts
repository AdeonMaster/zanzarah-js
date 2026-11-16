import {
  RWAtomic,
  RWBinaryFile,
  RWClump,
  RWFrameList,
  RWGeometry,
  RWGeometryList,
  RWMaterial,
  RWMaterialList,
  RWSkinPLG,
  RWString,
  RWTexture,
  ZBinaryReader,
} from '@zanzarah.js/engine/rw'
import { Buffer } from 'buffer'
import * as THREE from 'three'
import { getNestedDirectoryHandle } from '../utils/index.js'

const COLOR_MULTIPLIER = 2

interface ColorData {
  r: number
  g: number
  b: number
}

interface ParsedGeometry {
  geometry: THREE.BufferGeometry
  materials: THREE.MeshBasicMaterial[]
  skin: RWSkinPLG | null
}

export class DFFLoader {
  private modelPath = ''
  private texturePath = ''

  setModelPath(path: string): this {
    this.modelPath = this.normalizeDirectoryPath(path)
    return this
  }

  setTexturePath(path: string): this {
    this.texturePath = this.normalizeDirectoryPath(path)
    return this
  }

  async loadAsync(
    rootDirHandler: FileSystemDirectoryHandle,
    fileName: string,
    onProgress?: (event: ProgressEvent) => void,
  ): Promise<THREE.Group> {
    const normalizedName = fileName.replaceAll('\\', '/').replace(/^\/+/, '')
    if (normalizedName.split('/').some((part) => part === '..')) {
      throw new Error(
        `DFF path must stay within the selected directory: ${fileName}`,
      )
    }
    const modelRelativePath = [this.modelPath, normalizedName]
      .filter(Boolean)
      .join('/')
    const modelParts = modelRelativePath.split('/').filter(Boolean)
    const modelFileName = modelParts.pop()
    if (!modelFileName) throw new Error('A DFF file name is required')
    const modelDirectory = modelParts.length
      ? await getNestedDirectoryHandle(rootDirHandler, modelParts.join('/'))
      : rootDirHandler
    const modelFile = await (
      await modelDirectory.getFileHandle(modelFileName)
    ).getFile()
    const data = await modelFile.arrayBuffer()
    onProgress?.(
      new ProgressEvent('progress', {
        lengthComputable: true,
        loaded: data.byteLength,
        total: modelFile.size,
      }),
    )

    const sections = RWBinaryFile.read(new ZBinaryReader(Buffer.from(data)))
    const textureUrls = new Map<string, string>()
    const textureDirectory = this.texturePath
      ? await getNestedDirectoryHandle(rootDirHandler, this.texturePath)
      : rootDirHandler
    for (const textureSection of sections.flatMap((section) =>
      section.findAll(RWTexture),
    )) {
      const [colorName, alphaName] = textureSection
        .findChildren(RWString)
        .map((item) => item.value.trim())
      for (const name of [colorName, alphaName]) {
        if (!name) continue
        const normalized = name
          .replaceAll('\\', '/')
          .split('/')
          .pop()!
          .toUpperCase()
        const filename = /\.[A-Z0-9]+$/.test(normalized)
          ? normalized
          : `${normalized}.BMP`
        if (textureUrls.has(filename)) continue
        try {
          const file = await (
            await textureDirectory.getFileHandle(filename)
          ).getFile()
          textureUrls.set(filename, URL.createObjectURL(file))
        } catch {
          // Missing textures are handled as failed TextureLoader requests below.
        }
      }
    }
    return this.parseSections(sections, textureUrls)
  }

  private parseSections(
    sections: ReturnType<typeof RWBinaryFile.read>,
    textureUrls: Map<string, string>,
  ): THREE.Group {
    const clump = sections.find(
      (section): section is RWClump => section instanceof RWClump,
    )

    if (!clump) {
      throw new Error('No RenderWare clump found in DFF data')
    }

    const geometryList = clump.findChild(RWGeometryList)
    const geometries = geometryList?.findChildren(RWGeometry) ?? []
    if (geometries.length === 0) {
      throw new Error('No geometry found in DFF data')
    }

    const textureLoader = new THREE.TextureLoader()
    const group = new THREE.Group()
    const frames = clump.findChild(RWFrameList)?.struct?.frames ?? []
    const frameObjects = this.createFrameHierarchy(frames, group)
    const parsedGeometries = new Map<number, ParsedGeometry>()
    let meshCount = 0

    const addMesh = (geometryIndex: number, frameIndex: number) => {
      const geometrySection = geometries[geometryIndex]
      if (!geometrySection) return

      let parsed = parsedGeometries.get(geometryIndex)
      if (!parsed) {
        parsed = this.parseGeometry(geometrySection, textureLoader, textureUrls)
        parsedGeometries.set(geometryIndex, parsed)
      }

      const mesh = parsed.skin
        ? new THREE.SkinnedMesh(parsed.geometry, parsed.materials)
        : new THREE.Mesh(parsed.geometry, parsed.materials)
      mesh.name = `Geometry_${geometryIndex}`

      const frame = frameObjects[frameIndex]
      if (frame) {
        frame.add(mesh)
      } else {
        group.add(mesh)
      }

      if (parsed.skin) {
        group.updateMatrixWorld(true)
        const skeleton = this.createSkeleton(
          parsed.skin,
          frames,
          frameObjects,
          group,
        )
        if (skeleton && mesh instanceof THREE.SkinnedMesh) {
          mesh.bind(skeleton)
        }
      }

      meshCount += 1
    }

    const atomics = clump.findChildren(RWAtomic)
    if (atomics.length > 0) {
      for (const atomic of atomics) {
        const data = atomic.struct
        if (!data) continue
        addMesh(data.geometryIndex, data.frameIndex)
      }
    } else {
      geometries.forEach((_geometry, index) => addMesh(index, -1))
    }

    if (meshCount === 0) {
      throw new Error('No renderable geometry found in DFF data')
    }

    group.updateMatrixWorld(true)
    return group
  }

  private createFrameHierarchy(
    frames: Array<{
      frameIndex: number
      rotMatrix0: { x: number; y: number; z: number }
      rotMatrix1: { x: number; y: number; z: number }
      rotMatrix2: { x: number; y: number; z: number }
      position: { x: number; y: number; z: number }
    }>,
    group: THREE.Group,
  ): THREE.Group[] {
    const objects = frames.map((frame, index) => {
      const object = new THREE.Group()
      object.name = `Frame_${index}`
      const matrix = new THREE.Matrix4().set(
        frame.rotMatrix0.x,
        frame.rotMatrix1.x,
        frame.rotMatrix2.x,
        frame.position.x,
        frame.rotMatrix0.y,
        frame.rotMatrix1.y,
        frame.rotMatrix2.y,
        frame.position.y,
        frame.rotMatrix0.z,
        frame.rotMatrix1.z,
        frame.rotMatrix2.z,
        frame.position.z,
        0,
        0,
        0,
        1,
      )
      matrix.decompose(object.position, object.quaternion, object.scale)
      return object
    })

    frames.forEach((frame, index) => {
      const parentIndex = frame.frameIndex
      const parent =
        parentIndex >= 0 && parentIndex < objects.length
          ? objects[parentIndex]
          : undefined

      if (parent && !this.hasFrameCycle(index, parentIndex, frames)) {
        parent.add(objects[index])
      } else {
        group.add(objects[index])
      }
    })

    return objects
  }

  private hasFrameCycle(
    frameIndex: number,
    parentIndex: number,
    frames: Array<{ frameIndex: number }>,
  ): boolean {
    const visited = new Set<number>()
    let current = parentIndex

    while (current >= 0 && current < frames.length) {
      if (current === frameIndex || visited.has(current)) return true
      visited.add(current)
      current = frames[current].frameIndex
    }

    return false
  }

  private parseGeometry(
    section: RWGeometry,
    textureLoader: THREE.TextureLoader,
    textureUrls: Map<string, string>,
  ): ParsedGeometry {
    const data = section.struct
    const baseTarget = data?.morphTargets[0]
    const vertices = baseTarget?.vertices ?? []
    if (!data || vertices.length === 0) {
      throw new Error('DFF geometry has no supported vertex data')
    }

    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []
    const uvs: number[] = []
    const textureCoordinates = data.texCoords[0]

    for (let index = 0; index < vertices.length; index += 1) {
      const vertex = vertices[index]
      positions.push(vertex.x, vertex.y, vertex.z)

      const color = data.colors[index]
      if (color) {
        const converted =
          this.toThreeColor(color).multiplyScalar(COLOR_MULTIPLIER)
        colors.push(converted.r, converted.g, converted.b)
      } else {
        colors.push(1, 1, 1)
      }

      const uv = textureCoordinates?.[index]
      uvs.push(uv?.x ?? 0, uv ? 1 - uv.y : 0)
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    const baseNormals = baseTarget?.normals
    if (baseNormals?.length === vertices.length) {
      const normals = baseNormals.flatMap((normal) => [
        normal.x,
        normal.y,
        normal.z,
      ])
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3),
      )
    }

    const morphTargets = data.morphTargets.slice(1)
    const positionMorphs = morphTargets
      .filter((target) => target.vertices.length === vertices.length)
      .map(
        (target) =>
          new THREE.Float32BufferAttribute(
            target.vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]),
            3,
          ),
      )
    if (positionMorphs.length > 0) {
      geometry.morphAttributes.position = positionMorphs
      geometry.morphTargetsRelative = false
    }

    const normalMorphs = morphTargets.map((target) => target.normals)
    if (
      normalMorphs.length > 0 &&
      normalMorphs.every((normals) => normals.length === vertices.length)
    ) {
      geometry.morphAttributes.normal = normalMorphs.map(
        (normals) =>
          new THREE.Float32BufferAttribute(
            normals.flatMap((normal) => [normal.x, normal.y, normal.z]),
            3,
          ),
      )
    }

    const skin =
      section
        .findAll(RWSkinPLG)
        .find((candidate) => candidate.bones.length > 0) ?? null
    if (skin?.bones.length) {
      if (
        skin.vertexIndices.length < vertices.length * 4 ||
        skin.vertexWeights.length < vertices.length * 4
      ) {
        throw new Error(
          'DFF skin data does not match the geometry vertex count',
        )
      }

      const skinIndices: number[] = []
      const skinWeights: number[] = []
      for (
        let vertexIndex = 0;
        vertexIndex < vertices.length;
        vertexIndex += 1
      ) {
        const offset = vertexIndex * 4
        const weights = Array.from({ length: 4 }, (_, slot) =>
          Math.max(0, skin.vertexWeights[offset + slot]),
        )
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

        for (let slot = 0; slot < 4; slot += 1) {
          const boneIndex = skin.vertexIndices[offset + slot]
          skinIndices.push(boneIndex < skin.bones.length ? boneIndex : 0)
          skinWeights.push(
            totalWeight > 0 ? weights[slot] / totalWeight : slot === 0 ? 1 : 0,
          )
        }
      }

      geometry.setAttribute(
        'skinIndex',
        new THREE.Uint16BufferAttribute(skinIndices, 4),
      )
      geometry.setAttribute(
        'skinWeight',
        new THREE.Float32BufferAttribute(skinWeights, 4),
      )
    }

    const materials = this.parseMaterials(
      section.findChild(RWMaterialList),
      textureLoader,
      textureUrls,
    )
    let groupStart = 0
    let currentMaterialIndex: number | null = null
    const indices: number[] = []

    for (const triangle of data.triangles) {
      const triangleIndices = [triangle.v1, triangle.v2, triangle.v3]
      for (const index of triangleIndices) {
        if (index >= vertices.length) {
          throw new Error(
            `DFF triangle references vertex ${index}, but the geometry has ${vertices.length} vertices`,
          )
        }
      }

      const materialIndex =
        triangle.m >= 0 && triangle.m < materials.length ? triangle.m : 0
      if (currentMaterialIndex !== materialIndex) {
        if (currentMaterialIndex !== null) {
          geometry.addGroup(
            groupStart,
            indices.length - groupStart,
            currentMaterialIndex,
          )
        }
        currentMaterialIndex = materialIndex
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
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return { geometry, materials, skin }
  }

  private parseMaterials(
    materialList: RWMaterialList | null,
    textureLoader: THREE.TextureLoader,
    textureUrls: Map<string, string>,
  ): THREE.MeshBasicMaterial[] {
    const fallbackMaterial = () =>
      new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true })

    if (!materialList) return [fallbackMaterial()]

    const definitions = materialList.children.filter(
      (section): section is RWMaterial => section instanceof RWMaterial,
    )
    const materialIndices = materialList.struct?.materialIndices

    if (!materialIndices?.length) {
      return definitions.length
        ? definitions.map((section) =>
            this.parseMaterial(section, textureLoader, textureUrls),
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
            ? this.parseMaterial(section, textureLoader, textureUrls)
            : fallbackMaterial(),
        )
      } else {
        materials.push(materials[materialIndex] ?? fallbackMaterial())
      }
    }

    return materials.length ? materials : [fallbackMaterial()]
  }

  private parseMaterial(
    section: RWMaterial,
    textureLoader: THREE.TextureLoader,
    textureUrls: Map<string, string>,
  ): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial({
      color: section.struct?.color
        ? this.toThreeColor(section.struct.color)
        : 0xffffff,
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
        textureUrls,
        true,
      )
    }
    if (alphaName) {
      material.alphaMap = this.loadTexture(
        alphaName,
        textureLoader,
        textureUrls,
        false,
      )
      material.transparent = true
      material.depthWrite = false
      material.alphaTest = 0.05
    }

    return material
  }

  private loadTexture(
    name: string,
    textureLoader: THREE.TextureLoader,
    textureUrls: Map<string, string>,
    isColor: boolean,
  ): THREE.Texture {
    const normalizedName = name.trim().replaceAll('\\', '/').toUpperCase()
    const filename = /\.[A-Z0-9]+$/.test(normalizedName)
      ? normalizedName
      : `${normalizedName}.BMP`
    const url = textureUrls.get(filename)
    if (!url) {
      console.warn(`Failed to load DFF texture ${filename}`)
      return new THREE.Texture()
    }
    const texture = textureLoader.load(url, undefined, undefined, (error) =>
      console.warn(`Failed to load DFF texture ${filename}:`, error),
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    if (isColor) texture.colorSpace = THREE.SRGBColorSpace

    return texture
  }

  private normalizeDirectoryPath(path: string): string {
    const normalized = path.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '')
    if (normalized.split('/').some((part) => part === '..')) {
      throw new Error(
        `DFF directory path must stay within the selected directory: ${path}`,
      )
    }
    return normalized
  }

  private createSkeleton(
    skin: RWSkinPLG,
    frames: Array<{ frameIndex: number }>,
    frameObjects: THREE.Group[],
    group: THREE.Group,
  ): THREE.Skeleton | null {
    if (skin.bones.length === 0) return null

    group.updateMatrixWorld(true)
    const boneFrameIndices = skin.bones.map((bone) => {
      if (bone.idx >= 0 && bone.idx < frames.length) return bone.idx
      if (bone.id >= 0 && bone.id < frames.length) return bone.id
      return -1
    })
    const boneByFrame = new Map<number, number>()
    boneFrameIndices.forEach((frameIndex, boneIndex) => {
      if (frameIndex >= 0) boneByFrame.set(frameIndex, boneIndex)
    })

    const parentBoneIndices = boneFrameIndices.map((frameIndex) => {
      let parentFrameIndex =
        frameIndex >= 0 ? (frames[frameIndex]?.frameIndex ?? -1) : -1
      const visited = new Set<number>()
      while (
        parentFrameIndex >= 0 &&
        parentFrameIndex < frames.length &&
        !visited.has(parentFrameIndex)
      ) {
        const parentBoneIndex = boneByFrame.get(parentFrameIndex)
        if (parentBoneIndex !== undefined) return parentBoneIndex
        visited.add(parentFrameIndex)
        parentFrameIndex = frames[parentFrameIndex].frameIndex
      }
      return -1
    })

    const bones = skin.bones.map((bone, index) => {
      const object = new THREE.Bone()
      object.name = `Bone_${bone.id}_${bone.idx}`
      const frameIndex = boneFrameIndices[index]
      const frameObject = frameObjects[frameIndex]
      if (frameObject) {
        const parentBoneIndex = parentBoneIndices[index]
        const parentFrameObject =
          parentBoneIndex >= 0
            ? frameObjects[boneFrameIndices[parentBoneIndex]]
            : undefined
        const parentMatrix = parentFrameObject?.matrixWorld ?? group.matrixWorld
        const localMatrix = parentMatrix
          .clone()
          .invert()
          .multiply(frameObject.matrixWorld)
        localMatrix.decompose(object.position, object.quaternion, object.scale)
      }
      return object
    })

    bones.forEach((object, index) => {
      const parentBoneIndex = parentBoneIndices[index]
      if (parentBoneIndex >= 0 && parentBoneIndex !== index) {
        bones[parentBoneIndex].add(object)
      } else {
        group.add(object)
      }
    })

    group.updateMatrixWorld(true)
    const inverses = skin.bones.map((bone, index) => {
      const matrix = bone.objectToBone
      const inverse = new THREE.Matrix4().set(
        matrix.m11,
        matrix.m21,
        matrix.m31,
        matrix.m41,
        matrix.m12,
        matrix.m22,
        matrix.m32,
        matrix.m42,
        matrix.m13,
        matrix.m23,
        matrix.m33,
        matrix.m43,
        matrix.m14,
        matrix.m24,
        matrix.m34,
        matrix.m44,
      )
      if (Math.abs(inverse.determinant()) < 1e-12) {
        inverse.copy(bones[index].matrixWorld).invert()
      }
      return inverse
    })

    return new THREE.Skeleton(bones, inverses)
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

export default DFFLoader
