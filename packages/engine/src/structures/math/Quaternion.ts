import type { Float } from "../../types.ts"

export class Quaternion {
  x: Float
  y: Float
  z: Float
  w: Float

  constructor(x: Float = 0.0, y: Float = 0.0, z: Float = 0.0, w: Float = 0.0) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }
}
