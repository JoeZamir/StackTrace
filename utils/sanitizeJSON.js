import sanitizeHtml from 'sanitize-html'

export function sanitizeJSON(jason) {
    const sanitized = {}

    for (const [key, value] of Object.entries(jason)) {
        sanitized[key] = typeof value === 'string'
            ? sanitizeHtml(value, { allowedTags: ['b'], allowedAttributes: false })
            : value;
    }
    return sanitized
}

export function sanitizePostJSON(jason) {
    const sanitized = {}

    for (const [key, value] of Object.entries(jason)) {
        sanitized[key] = typeof value === 'string'
            ? sanitizeHtml(value, { allowedTags: ['b', 'pre', 'code'], allowedAttributes: false })
            : value;
    }
    return sanitized
}
