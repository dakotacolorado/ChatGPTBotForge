import { readFileSync } from 'fs'
import { glob } from 'glob'

/**
 * Read all the files in the directory into a map of [file name, file content]
 * @param filepath The path to the directory to read
 */
export default async function readFiles (filepath: string) {
  const files = await glob('**/*.ts', { ignore: ['node_modules/**', 'config/**'] })
  return files.map(filename => [
    filename,
    readFileSync(`${filepath}/${filename}`, 'utf8')
  ])
}
