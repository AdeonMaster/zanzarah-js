// import type { ZBinaryReader } from "../../utils/ZBinaryReader.ts";
// import type { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts";
// import { Vector3 } from "../math/Vector3.ts";

// export enum SceneEffectType {
//   Leaves = 1,
//   Unused4 = 4,
//   Unused5 = 5,
//   Unknown6 = 6,
//   Unused7 = 7,
//   Unknown10 = 10,
//   Snowflakes = 11,
//   Combiner = 13,

//   Unknown = -1
// }

// export enum SceneEffectReadVersion {
//   V1,
//   V2
// }

// export enum SceneEffectOrder {
//   Early,
//   Solid,
//   Late
// }

// export class SceneEffectV2 {
//   idx: number
//   type: SceneEffectType
//   pos: Vector3
//   end: Vector3
//   dir: Vector3
//   up: Vector3
//   param: number
//   effectFile: string
//   order: SceneEffectOrder

//   constructor() {
//     this.idx = 0
//     this.type = SceneEffectType.Leaves
//     this.pos = new Vector3()
//     this.end = new Vector3()
//     this.dir = new Vector3()
//     this.up = new Vector3()
//     this.param = 0
//     this.effectFile = ''
//     this.order = SceneEffectOrder.Late
//   }

//   write(handler: ZBinaryWriter) {

//   }

//   static read(handler: ZBinaryReader) {
//     const instance = new this()

//     instance.idx = handler.readUInt32()
//     instance.type = handler.readInt32()

//     return instance
//   }
// }
