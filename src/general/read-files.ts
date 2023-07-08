import { readFileSync } from 'fs'
import { glob } from 'glob'

/**
 * Read all the files in the directory into a map of [file name, file content]
 * @param filepath The path to the directory to read
 */
export async function readFiles (filepath: string): Promise<string[][]> {
  const files = await glob('**/*.ts', { ignore: ['node_modules/**', 'config/**'] })
  return files.map(filename => [
    filename,
    readFileSync(`${filepath}/${filename}`, 'utf8')
  ])
}

export async function readFilesToMarkdown (filepath: string): Promise<string> {
  return (await readFiles(filepath)).map(f => `\n### Filename: ${f[0]} \n \`\`\`\n${f[1]}\n\`\`\``).join('\n')
}
