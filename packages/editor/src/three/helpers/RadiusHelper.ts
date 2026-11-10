import * as THREE from 'three'

export class RadiusHelper extends THREE.Group {
  private readonly geometry: THREE.BufferGeometry
  private readonly arcs = new THREE.Group()

  readonly visibleMaterial: THREE.LineBasicMaterial
  readonly hiddenMaterial: THREE.LineBasicMaterial

  constructor(
    radius: number,
    color: THREE.ColorRepresentation = 0x80a676,
    hiddenOpacity = 0.18,
  ) {
    super()

    // Unit circle shared by every line; radius is applied through scale.
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0)

    this.geometry = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(64),
    )

    this.visibleMaterial = new THREE.LineBasicMaterial({
      color,
      depthTest: true,
      depthFunc: THREE.LessEqualDepth,
      depthWrite: false,
    })

    this.hiddenMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: hiddenOpacity,
      depthTest: true,
      depthFunc: THREE.GreaterDepth,
      depthWrite: false,
    })

    const rotations = [
      new THREE.Euler(0, 0, 0), // XY
      new THREE.Euler(Math.PI / 2, 0, 0), // XZ
      new THREE.Euler(0, Math.PI / 2, 0), // YZ
    ]

    for (const rotation of rotations) {
      for (const material of [this.visibleMaterial, this.hiddenMaterial]) {
        const line = new THREE.Line(this.geometry, material)
        line.rotation.copy(rotation)
        line.renderOrder = 1

        this.arcs.add(line)
      }
    }

    this.add(this.arcs)
    this.setRadius(radius)
  }

  setRadius(radius: number): this {
    this.arcs.scale.setScalar(radius)
    return this
  }

  dispose(): void {
    this.geometry.dispose()
    this.visibleMaterial.dispose()
    this.hiddenMaterial.dispose()
  }
}
