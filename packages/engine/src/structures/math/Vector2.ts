import type { Float } from '../../types.ts'

export class Vector2 {
  x: Float
  y: Float

  constructor(x: Float = 0.0, y: Float = 0.0) {
    this.x = x
    this.y = y
  }
}
