const findAllOccurrences = (
  data: Buffer,
  needle: Buffer,
  offset: number = 0,
): number[] => {
  if (needle.length === 0) {
    throw new Error('Needle cannot be empty')
  }

  const positions: number[] = []
  let currentOffset = offset

  while (currentOffset <= data.length - needle.length) {
    const foundAt = data.indexOf(needle, currentOffset)

    if (foundAt === -1) {
      break
    }

    positions.push(foundAt)

    // Advance by one so overlapping matches are included.
    currentOffset = foundAt + 1
  }

  return positions
}

const replaceAt = (
  data: Buffer,
  offset: number,
  needle: Buffer,
  replacement: Buffer,
): Buffer => {
  if (needle.length === 0) {
    throw new Error('Needle cannot be empty')
  }

  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset + needle.length > data.length
  ) {
    throw new RangeError('Offset is outside the buffer')
  }

  // Ensure the needle is actually present at the given offset.
  if (!data.subarray(offset, offset + needle.length).equals(needle)) {
    throw new Error('Needle does not match at the given offset')
  }

  return Buffer.concat([
    data.subarray(0, offset),
    replacement,
    data.subarray(offset + needle.length),
  ])
}

export type Patch = {
  name: string
  steps: {
    expected: string
    replacement: string
    offset: number
  }[]
}

export const normalizeMemory = (str: string) =>
  str.split(' ').map((chunk) => parseInt(chunk, 16))

export const getIsPatchApplied = (
  buffer: Buffer,
  name: string,
  patches: Patch[],
) => {
  const patch = patches.find((p) => p.name === name)
  if (!patch) throw new Error('Invalid patch name')

  for (let i = 0; i < patch.steps.length; ++i) {
    const step = patch.steps[i]
    const matches = findAllOccurrences(
      buffer,
      Buffer.from(normalizeMemory(step.expected)),
      step.offset,
    )
    if (matches.length === 0) return true
  }

  return false
}

export const applyPatch = (buffer: Buffer, name: string, patches: Patch[]) => {
  const patch = patches.find((p) => p.name === name)
  if (!patch) throw new Error('Invalid patch name')

  let tmpBuffer = Buffer.from(buffer)
  for (let i = 0; i < patch.steps.length; ++i) {
    const step = patch.steps[i]
    const needle = Buffer.from(normalizeMemory(step.expected))
    const replacer = Buffer.from(normalizeMemory(step.replacement))
    const offset = step.offset
    const matches = findAllOccurrences(tmpBuffer, needle, offset)
    if (matches.length === 0)
      throw new Error('Selected patch is already applied')

    tmpBuffer = Buffer.from(replaceAt(tmpBuffer, matches[0], needle, replacer))
  }

  return tmpBuffer
}
