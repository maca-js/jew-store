export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  console.log('[telegram] token:', !!token, 'chatId:', !!chatId)
  if (!token || !chatId) {
    console.log('[telegram] missing env vars, skipping')
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const json = await res.json()
    console.log('[telegram] response:', JSON.stringify(json))
  } catch (err) {
    console.log('[telegram] error:', err)
  }
}
