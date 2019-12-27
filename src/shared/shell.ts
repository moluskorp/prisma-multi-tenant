import { exec } from 'child_process'
import fs from 'fs'

import { getManagementEnv } from './schema'
import { photonManagementPath } from './constants'
import { Datasource } from './types'

const findNodeModules = require('find-node-modules')

let distantBin: string

export const findBin = async () => {
  if (distantBin) return distantBin

  distantBin =
    ((await runShell('npm bin', {
      cwd: process.cwd()
    })) as string).trim() + '/'

  return distantBin
}

// Run in this directory
export const runLocal = async (cmd: string) => {
  const nodeModules = findNodeModules({ cwd: process.cwd(), relative: false })[0]

  const managementEnv = await getManagementEnv()

  const baseFolder = await findBin()

  await runShell(baseFolder + cmd, {
    cwd: __dirname + '/../cli',
    env: {
      ...process.env,
      ...managementEnv,
      PMT_OUTPUT: nodeModules + '/' + photonManagementPath
    }
  })
}

// Run from the place where the CLI was called
export const runDistant = async (cmd: string, tenant?: Datasource) => {
  const baseFolder = await findBin()

  return runShell(baseFolder + cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PMT_URL: tenant ? tenant.url : 'PMT_TMP_URL'
    }
  })
}

export const runShell = (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string } }
): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('  $> ' + cmd)
  }

  return new Promise((resolve, reject) => {
    exec(cmd, options, (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
      if (process.env.verbose == 'true') {
        console.log(stderr || stdout)
      }
      if (error) reject(error)
      resolve(stdout)
    })
  })
}

export const writeFile = (path: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

export const fileExists = (path: string) => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    })
  })
}

export const requireDistant = (name: string) => {
  return require(require.resolve(name, {
    paths: [process.cwd()]
  }))
}

export const useYarn = () => {
  return fileExists(process.cwd() + '/yarn.lock')
}