import crypto from 'crypto'

const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY!
const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY!

function sign(data: string): string {
  return crypto
    .createHash('sha1')
    .update(PRIVATE_KEY + data + PRIVATE_KEY)
    .digest('base64')
}

export interface LiqPayParams {
  orderId: string
  amount: number
  description: string
  resultUrl: string
  serverUrl: string
  currency?: string
}

export function createLiqPayForm(params: LiqPayParams): {
  data: string
  signature: string
} {
  const payload = {
    public_key: PUBLIC_KEY,
    version: '3',
    action: 'pay',
    amount: params.amount,
    currency: params.currency ?? 'UAH',
    description: params.description,
    order_id: params.orderId,
    result_url: params.resultUrl,
    server_url: params.serverUrl,
    sandbox: process.env.NODE_ENV !== 'production' ? 1 : 0,
  }

  const data = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = sign(data)

  return { data, signature }
}

export function verifyLiqPayCallback(data: string, signature: string): boolean {
  const expected = sign(data)
  return expected === signature
}

export function decodeLiqPayData(data: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
}
