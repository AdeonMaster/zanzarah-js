export const getNestedDirectoryHandle = async (
  rootHandle: FileSystemDirectoryHandle,
  path: string,
  options?: { create?: boolean },
) => {
  const parts = path.split('/').filter(Boolean)
  let currentHandle = rootHandle

  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, options)
  }

  return currentHandle
}

export const normalizePath = (path: string) =>
  path.replace('..', '').replaceAll('\\', '/')
