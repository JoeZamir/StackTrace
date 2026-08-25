import { getData } from "./getData.js";
import path from 'node:path'
import fs from 'node:fs/promises'

export async function appendData(filename, newRecord) {
    try {
        const data = await getData(filename)
        data.push(newRecord)
        const filePath = path.join(import.meta.dirname, '..', 'data', filename)
        await fs.writeFile(filePath, JSON.stringify(data, null, '\t'), 'utf-8')
        return
    } catch (err) {
        throw new Error(`append error: ${err}`)
    }
}

export async function writeData(filename, data) {
    try {
        const filePath = path.join(import.meta.dirname, '..', 'data', filename)
        await fs.writeFile(filePath, JSON.stringify(data, null, '\t'), 'utf-8')
    } catch (err) {
        throw new Error(`write error: ${err}`)
    }
}
