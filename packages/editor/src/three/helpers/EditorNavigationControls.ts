import * as THREE from 'three'
import { PointerLockControls } from "three/examples/jsm/Addons.js"

const createEditorNavigationControls = (
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
) => {
  const look = new PointerLockControls(camera, canvas)
  look.pointerSpeed = 0.8

  const settings = {
    speed: 20, // World units per second
    fastMultiplier: 4,
  }

  const abort = new AbortController()
  const options = { signal: abort.signal }
  const previousTabIndex = canvas.tabIndex

  canvas.tabIndex = 0

  const keys = new Set<string>()
  const movementKeys = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight',
  ])

  const direction = new THREE.Vector3()
  let rightMouseDown = false

  const stop = () => {
    rightMouseDown = false
    keys.clear()

    if (document.pointerLockElement === canvas) {
      document.exitPointerLock()
    }
  }

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  }, options)

  canvas.addEventListener('mousedown', async (event) => {
    if (event.button !== 2) return

    event.preventDefault()
    canvas.focus({ preventScroll: true })
    rightMouseDown = true

    try {
      // Request directly so promise rejections can be handled.
      await canvas.requestPointerLock()

      // The button might have been released while acquiring the lock.
      if (!rightMouseDown || abort.signal.aborted) stop()
    } catch (error) {
      stop()
      console.warn('Could not enable camera navigation:', error)
    }
  }, options)

  window.addEventListener('mouseup', (event) => {
    if (event.button === 2) stop()
  }, options)

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas) {
      rightMouseDown = false
      keys.clear()
    } else if (!rightMouseDown) {
      stop()
    }
  }, options)

  window.addEventListener('keydown', (event) => {
    if (!rightMouseDown || !movementKeys.has(event.code)) return

    event.preventDefault()
    keys.add(event.code)
  }, options)

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code)
  }, options)

  window.addEventListener('blur', stop, options)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
  }, options)

  const pressed = (code: string) => Number(keys.has(code))

  return {
    settings,

    update(deltaSeconds: number) {
      if (!rightMouseDown || !look.isLocked) return

      // Local X = sideways; local -Z = forward.
      direction.set(
        pressed('KeyD') - pressed('KeyA'),
        0,
        pressed('KeyS') - pressed('KeyW'),
      )

      // Rotate movement into the camera's viewing direction.
      direction.applyQuaternion(camera.quaternion)

      // Q/E move along world Y.
      direction.y += pressed('KeyE') - pressed('KeyQ')

      if (direction.lengthSq() === 0) return

      // Prevent faster diagonal movement.
      direction.normalize()

      const fast = keys.has('ShiftLeft') || keys.has('ShiftRight')
      const speed = settings.speed * (fast ? settings.fastMultiplier : 1)

      // Limit jumps after a stalled frame.
      const delta = Math.min(deltaSeconds, 0.05)

      camera.position.addScaledVector(direction, speed * delta)
    },

    dispose() {
      stop()
      abort.abort()
      look.dispose()
      canvas.tabIndex = previousTabIndex
    },
  }
}

export default createEditorNavigationControls
