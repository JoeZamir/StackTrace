import path from 'node:path'
import fs from 'node:fs/promises'

export async function getData(filename) {

  const filePath = path.join(
    import.meta.dirname,
    '..',
    'data',
    filename
  )

  try {
    const data = await fs.readFile(filePath, 'utf-8')
    const parsedData = JSON.parse(data)

    return parsedData

  } catch (error) {

    return []

  }
}
