import { NextResponse } from 'next/server';

const fallbackReply = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes('harga') || text.includes('biaya')) return 'Untuk estimasi harga, kirimkan detail kebutuhan melalui form Pesan Jasa atau WhatsApp admin di 081326842285.';
  if (text.includes('layanan') || text.includes('jasa')) return 'PINA melayani website, aplikasi mobile, UI/UX design, software custom, dan IT consulting.';
  if (text.includes('kontak') || text.includes('whatsapp')) return 'Anda dapat menghubungi admin melalui WhatsApp di 081326842285.';
  return 'Terima kasih! Untuk jawaban yang lebih spesifik, jelaskan kebutuhan proyek Anda atau hubungi admin melalui WhatsApp 081326842285.';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 1000) return NextResponse.json({ error: 'Pesan tidak valid.' }, { status: 400 });

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;
    if (!apiKey || !apiUrl) return NextResponse.json({ reply: fallbackReply(message), fallback: true });

    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: 'Anda adalah asisten ramah untuk PINA subholding. Jawab ringkas dalam Bahasa Indonesia.' }, { role: 'user', content: message }], temperature: 0.5 }),
    });
    if (!upstream.ok) return NextResponse.json({ reply: fallbackReply(message), fallback: true });
    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content;
    return NextResponse.json({ reply: typeof reply === 'string' && reply.trim() ? reply.trim() : fallbackReply(message) });
  } catch {
    return NextResponse.json({ error: 'Bot sedang tidak tersedia.' }, { status: 500 });
  }
}
