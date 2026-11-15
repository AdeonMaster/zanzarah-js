import * as THREE from 'three'

export class MouseBoxHelper {
  private renderer: THREE.WebGLRenderer
  private size: number

  private scene = new THREE.Scene()
  private camera: THREE.OrthographicCamera
  private box: THREE.Group
  private resizeObserver: ResizeObserver

  public mouse = new THREE.Vector2(0, 0)

  private onPointerMove = (event: PointerEvent) => {
    const bounds = this.renderer.domElement.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top

    this.mouse.set(x, y)
    this.box.position.set(x, y, 0)
    this.box.visible = true
  }

  private onPointerLeave = () => {
    this.box.visible = false
  }

  constructor(renderer: THREE.WebGLRenderer, size = 32) {
    this.renderer = renderer
    this.size = size

    this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 10)
    this.camera.position.z = 5

    this.box = new THREE.Group()

    const fill = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        color: 0x55ccff,
        transparent: true,
        opacity: 0.18,
        depthTest: false,
        depthWrite: false,
      }),
    )

    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, size, 0),
        new THREE.Vector3(size, size, 0),
        new THREE.Vector3(size, 0, 0),
      ]),
      new THREE.LineBasicMaterial({
        color: 0x55ccff,
        depthTest: false,
        depthWrite: false,
      }),
    )

    this.box.add(fill, outline)
    this.box.visible = false
    this.scene.add(this.box)

    const canvas = renderer.domElement
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerleave', this.onPointerLeave)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
  }

  private resize() {
    const { width, height } = this.renderer.domElement.getBoundingClientRect()

    this.camera.left = 0
    this.camera.right = width
    this.camera.top = 0
    this.camera.bottom = height
    this.camera.updateProjectionMatrix()
  }

  /** Call after rendering your main scene. */
  render() {
    const wasAutoClear = this.renderer.autoClear
    this.renderer.autoClear = false
    this.renderer.clearDepth()
    this.renderer.render(this.scene, this.camera)
    this.renderer.autoClear = wasAutoClear
  }

  dispose() {
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointermove', this.onPointerMove)
    canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.resizeObserver.disconnect()

    this.box.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineLoop) {
        object.geometry.dispose()
        const material = object.material
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else material.dispose()
      }
    })
  }
}