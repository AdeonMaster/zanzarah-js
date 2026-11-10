export {}

declare global {
  interface Window {
    showOpenFilePicker(options?: {
      types?: Array<{
        description?: string
        accept: Record<string, string[]>
      }>
      excludeAcceptAllOption?: boolean
      multiple?: boolean
    }): Promise<Array<{ getFile(): Promise<File> }>>
  }
}
