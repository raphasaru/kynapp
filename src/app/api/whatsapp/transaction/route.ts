import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const runtime = 'nodejs';

interface TransactionData {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
}

interface RequestBody {
  phone_number: string;
  transaction_data: TransactionData;
}

export async function POST(request: NextRequest) {
  try {
    // Verify n8n webhook secret
    const webhookSecret = request.headers.get('x-n8n-secret');
    if (webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase env vars');
      return NextResponse.json(
        { error: 'Configuração do servidor' },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const body: RequestBody = await request.json();
    const { phone_number, transaction_data } = body;

    if (!phone_number || !transaction_data) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Find user by verified phone number
    const { data: linkData, error: linkError } = await supabase
      .from('user_whatsapp_links')
      .select('user_id')
      .eq('phone_number', phone_number)
      .not('verified_at', 'is', null)
      .single();

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: 'Telefone não vinculado' },
        { status: 404 }
      );
    }

    // Use RPC function: handles category mapping, inserts plaintext,
    // trigger handles whatsapp_messages counting + free tier limit
    const { data, error: rpcError } = await (supabase.rpc as any)('create_whatsapp_transaction', {
      p_user_id: linkData.user_id,
      p_type: transaction_data.type,
      p_amount: transaction_data.amount.toString(),
      p_category: transaction_data.category || 'other',
      p_description: transaction_data.description,
      p_due_date: new Date().toISOString().split('T')[0],
      p_status: 'completed',
    });

    if (rpcError) {
      // Trigger raises exception when free tier limit exceeded
      if (rpcError.message?.includes('limit reached')) {
        return NextResponse.json(
          {
            error: 'Limite de mensagens atingido',
            message: 'Você atingiu o limite de 30 mensagens do plano gratuito. Faça upgrade para Pro para mensagens ilimitadas.',
            upgrade_required: true,
          },
          { status: 429 }
        );
      }
      console.error('RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transaction: {
        id: (data as any)?.transaction_id,
        description: transaction_data.description,
        amount: transaction_data.amount,
        type: transaction_data.type,
      },
    });

  } catch (error) {
    console.error('Transaction callback error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
