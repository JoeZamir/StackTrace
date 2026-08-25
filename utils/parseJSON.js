export async function parseJSONBody(req) {
    let body = ''

    for await (const chunk of req) {
        body += chunk

    }

    try {
        return JSON.parse(body)

    } catch (error) {
        throw new Error(`Invalid JSON format: ${err}`)
    }

    return
}
