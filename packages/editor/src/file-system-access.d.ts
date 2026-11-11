export {}

declare global {
  interface FileSystemDirectoryHandle {
    readonly name: string
    getDirectoryHandle(
      name: string,
      options?: { create?: boolean },
    ): Promise<FileSystemDirectoryHandle>
    getFileHandle(
      name: string,
      options?: { create?: boolean },
    ): Promise<{ readonly name: string; getFile(): Promise<File> }>
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
  }

  interface Window {
    showOpenFilePicker(options?: {
      types?: Array<{
        description?: string
        accept: Record<string, string[]>
      }>
      excludeAcceptAllOption?: boolean
      multiple?: boolean
    }): Promise<Array<{ getFile(): Promise<File> }>>

    showDirectoryPicker(options?: {
      id?: string
      mode?: 'read' | 'readwrite'
      startIn?:
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | { readonly name: string }
    }): Promise<FileSystemDirectoryHandle>
  }
}
