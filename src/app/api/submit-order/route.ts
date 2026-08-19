import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, subject, message } = body;

    // Validation
    if (!customer_name || !customer_email || !subject || !message) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        subject,
        message,
        status: 'New',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan pesanan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Pesanan berhasil dikirim', order: data },
      { status: 201 }
    );
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
