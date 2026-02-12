import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Delete from user_whatsapp_links
    const { error } = await supabase
      .from('user_whatsapp_links')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error unlinking WhatsApp:', error);
      return NextResponse.json(
        { error: 'Erro ao desvincular WhatsApp' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unlink WhatsApp error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
