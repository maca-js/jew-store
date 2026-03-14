import { NextRequest, NextResponse } from 'next/server'

const NP_API = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POST_API_KEY ?? ''

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')
  const q = searchParams.get('q') ?? ''
  const cityRef = searchParams.get('cityRef') ?? ''

  if (action === 'cities') {
    const res = await fetch(NP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: { CityName: q, Limit: 10, Language: 'UA' },
      }),
    })
    const json = await res.json()
    if (!json?.success) {
      return NextResponse.json({ error: json?.errors ?? 'Nova Post API error', raw: json }, { status: 400 })
    }
    const addresses = json?.data?.[0]?.Addresses ?? []
    const results = addresses.map((a: { Ref: string; Present: string; DeliveryCity: string }) => ({
      ref: a.DeliveryCity || a.Ref,
      label: a.Present,
    }))
    return NextResponse.json(results)
  }

  if (action === 'branches') {
    const res = await fetch(NP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'AddressGeneral',
        calledMethod: 'getWarehouses',
        methodProperties: { CityRef: cityRef, Language: 'UA', Limit: 500 },
      }),
    })
    const json = await res.json()
    const warehouses = json?.data ?? []
    const results = warehouses.map((w: { Ref: string; Description: string }) => ({
      ref: w.Ref,
      label: w.Description,
    }))
    return NextResponse.json(results)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
