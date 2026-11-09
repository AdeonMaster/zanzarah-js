import type { Float } from "../../types.ts";

export class Matrix4x4 {
  m11: Float = 0.0
  m12: Float = 0.0
  m13: Float = 0.0
  m14: Float = 0.0
  m21: Float = 0.0
  m22: Float = 0.0
  m23: Float = 0.0
  m24: Float = 0.0
  m31: Float = 0.0
  m32: Float = 0.0
  m33: Float = 0.0
  m34: Float = 0.0
  m41: Float = 0.0
  m42: Float = 0.0
  m43: Float = 0.0
  m44: Float = 0.0

  constructor(
    m11: Float = 0.0, m12: Float = 0.0, m13: Float = 0.0, m14: Float = 0.0,
    m21: Float = 0.0, m22: Float = 0.0, m23: Float = 0.0, m24: Float = 0.0,
    m31: Float = 0.0, m32: Float = 0.0, m33: Float = 0.0, m34: Float = 0.0,
    m41: Float = 0.0, m42: Float = 0.0, m43: Float = 0.0, m44: Float = 0.0,
  ) {
    this.m11 = m11
    this.m12 = m12
    this.m13 = m13
    this.m14 = m14
    this.m21 = m21
    this.m22 = m22
    this.m23 = m23
    this.m24 = m24
    this.m31 = m31
    this.m32 = m32
    this.m33 = m33
    this.m34 = m34
    this.m41 = m41
    this.m42 = m42
    this.m43 = m43
    this.m44 = m44
  }
}
