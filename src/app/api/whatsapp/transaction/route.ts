import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { encryptFields } from '@/lib/crypto/encrypt';

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

    // Create admin Supabase client (service role)
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

    // Parse request body
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

    const userId = linkData.user_id;

    // Check free tier limit
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, whatsapp_messages_used')
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return NextResponse.json(
        { error: 'Erro ao verificar assinatura' },
        { status: 500 }
      );
    }

    // Enforce 30-message limit for free tier
    if (subscription.plan === 'free' && subscription.whatsapp_messages_used >= 30) {
      return NextResponse.json(
        {
          error: 'Limite de mensagens atingido',
          message: 'Você atingiu o limite de 30 mensagens do plano gratuito. Faça upgrade para Pro para mensagens ilimitadas.',
          upgrade_required: true,
        },
        { status: 429 }
      );
    }

    // Encrypt transaction data
    const encryptedData = await encryptFields('transactions', {
      amount: transaction_data.amount,
      description: transaction_data.description,
    }) as unknown as { amount: string; description: string };

    // Insert transaction
    const insertData: Database['public']['Tables']['transactions']['Insert'] = {
      user_id: userId,
      amount: encryptedData.amount,
      description: encryptedData.description,
      type: transaction_data.type,
      category: transaction_data.category || 'variable_other',
      status: 'planned',
      due_date: new Date().toISOString().split('T')[0], // Today's date
      source: 'whatsapp',
    };

    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert(insertData)
      .select('id, description, amount, type')
      .single();

    if (insertError || !data) {
      console.error('Error inserting transaction:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar transação' },
        { status: 500 }
      );
    }

    const transaction = data;

    // Increment WhatsApp messages counter
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        whatsapp_messages_used: subscription.whatsapp_messages_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating message counter:', updateError);
      // Don't fail the transaction creation, just log
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        description: transaction_data.description, // Return unencrypted for n8n
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
