import { createClient } from '@/lib/supabase/server';
import { phoneNumberSchema } from '@/lib/validators/phone-number';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const result = phoneNumberSchema.safeParse(body.phone_number);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Número de telefone inválido' },
        { status: 400 }
      );
    }

    const phoneNumber = result.data;

    // Generate 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Set expiry: 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Upsert into user_whatsapp_links
    const { error: upsertError } = await supabase
      .from('user_whatsapp_links')
      .upsert({
        user_id: user.id,
        phone_number: phoneNumber,
        verification_code: code,
        verification_expires_at: expiresAt.toISOString(),
        verified_at: null,
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error upserting whatsapp link:', upsertError);
      return NextResponse.json(
        { error: 'Erro ao gerar código de verificação' },
        { status: 500 }
      );
    }

    // Build WhatsApp deep link
    const botNumber = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER;
    if (!botNumber) {
      console.error('NEXT_PUBLIC_WHATSAPP_BOT_NUMBER not configured');
      return NextResponse.json(
        { error: 'Número do bot não configurado' },
        { status: 500 }
      );
    }

    const message = `Verificação KYN: ${code}`;
    const deepLink = `https://wa.me/${botNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      code,
      deepLink,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Verify WhatsApp error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
