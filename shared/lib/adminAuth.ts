async function hmacHex(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createAdminToken(secret: string): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `admin:${exp}`
  const sig = await hmacHex(payload, secret)
  return `${payload}.${sig}`
}

export async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return false
    const payload = token.slice(0, lastDot)
    const sig = token.slice(lastDot + 1)
    const expectedSig = await hmacHex(payload, secret)
    if (sig.length !== expectedSig.length) return false
    let diff = 0
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i)
    if (diff !== 0) return false
    const exp = parseInt(payload.split(':')[1])
    return !isNaN(exp) && Date.now() < exp
  } catch {
    return false
  }
}
