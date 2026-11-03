import fs from 'node:fs'
import type { CommandModule } from 'yargs'
import { applyPatch, getIsPatchApplied } from './../patcher/index.ts'
import toml from 'toml'
import path from 'node:path'

interface PatchArgs {
  name: string
  inputPath: string
  outputPath?: string
}

const patchCommand = {
  command: 'patch <name> <inputPath> [outputPath]',
  describe: 'Apply a patch to a file',

  builder: (yargs) =>
    yargs
      .positional('name', {
        type: 'string',
        demandOption: true,
        describe: 'Patch name',
      })
      .positional('inputPath', {
        type: 'string',
        demandOption: true,
        describe: 'Input file',
      })
      .positional('outputPath', {
        type: 'string',
        describe: 'Output file; defaults to the input file',
      }),

  handler: (args) => {
    const patchesFile = fs.readFileSync(path.resolve('patches.toml'), 'utf8')
    const data = toml.parse(patchesFile)

    if (!fs.existsSync(args.inputPath)) {
      throw new Error(`File doesn't exist: ${args.inputPath}`)
    }

    const buffer = fs.readFileSync(args.inputPath)

    if (getIsPatchApplied(buffer, args.name, data.patches)) {
      console.log(`"${args.name}" patch is already applied!`)
      return
    }

    console.log(`Applying "${args.name}" patch...`)
    const outBuffer = applyPatch(buffer, args.name, data.patches)
    const outputPath = args.outputPath ?? args.inputPath

    fs.writeFileSync(outputPath, outBuffer)
    console.log('Done!')
  },
} satisfies CommandModule<{}, PatchArgs>

export default patchCommand
