#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import patchCommand from './cmds/patch.js'

yargs(hideBin(process.argv))
  .command(patchCommand)
  .demandCommand(1)
  .strict()
  .help()
  .parse()
