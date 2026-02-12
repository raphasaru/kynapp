import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Query user_whatsapp_links for current user
    const { data, error } = await supabase
      .from('user_whatsapp_links')
      .select('phone_number, verified_at')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // Not linked yet
      return NextResponse.json({ linked: false });
    }

    // Check if verified
    if (data.verified_at) {
      return NextResponse.json({
        linked: true,
        phone_number: data.phone_number,
        verified_at: data.verified_at,
      });
    }

    // Pending verification
    return NextResponse.json({
      linked: false,
      pending: true,
      phone_number: data.phone_number,
    });

  } catch (error) {
    console.error('Check WhatsApp error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
