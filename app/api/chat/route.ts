import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// POST - Enviar mensaje al chat y procesar comandos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, leadIds } = body;

    // Guardar mensaje del usuario
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: 'user',
        content: message,
        metadata: leadIds ? JSON.stringify({ leadIds }) : null,
      },
    });

    // Procesar comandos específicos
    let response = '';
    let action = null;

    const lowerMessage = message.toLowerCase();

    // Comando: "cuales tienen correo bueno"
    if (lowerMessage.includes('correo') && (lowerMessage.includes('bueno') || lowerMessage.includes('buenos'))) {
      const leads = await prisma.lead.findMany({
        where: {
          id: leadIds ? { in: leadIds } : undefined,
          email: { not: null },
          score: { gte: 70 }, // Score alto = correo bueno
        },
        take: 10,
      });

      response = `Encontré ${leads.length} leads con correo válido y score alto:\n\n`;
      leads.forEach((lead, idx) => {
        response += `${idx + 1}. ${lead.nombre} - ${lead.email} (Score: ${lead.score})\n`;
      });

      action = {
        type: 'show_leads',
        leads: leads.map(l => l.id),
      };
    }
    // Comando: "mandales correo" o "enviales correo"
    else if (lowerMessage.includes('mandar') || lowerMessage.includes('enviar') || lowerMessage.includes('manda') || lowerMessage.includes('envia')) {
      const leads = await prisma.lead.findMany({
        where: {
          id: leadIds ? { in: leadIds } : undefined,
          email: { not: null },
        },
        take: 20,
      });

      // Crear contactos para envío
      const contacts = await Promise.all(
        leads.map(lead =>
          prisma.contact.create({
            data: {
              leadId: lead.id,
              email: lead.email!,
              nombre: lead.nombre,
              asunto: `Oportunidad de negocio - ${lead.industria}`,
              mensaje: `Hola ${lead.nombre},\n\nNos interesa contactarte para una oportunidad de negocio relacionada con ${lead.industria}.\n\nSaludos,\nSapiens Laboratories`,
              enviado: false,
            },
          })
        )
      );

      response = `He preparado ${contacts.length} correos para enviar. Los contactos están listos en la cola de envío.`;
      action = {
        type: 'emails_queued',
        count: contacts.length,
      };
    }
    // Otros comandos - usar OpenAI
    else {
      const leads = leadIds
        ? await prisma.lead.findMany({
            where: { id: { in: leadIds } },
            take: 10,
          })
        : [];

      const systemPrompt = `Eres un asistente de prospección para Sapiens Laboratories. 
Tienes acceso a ${leads.length} leads. 
Puedes ayudar a:
- Filtrar leads por criterios
- Analizar datos de leads
- Sugerir acciones de seguimiento
- Responder preguntas sobre los leads

Leads disponibles: ${JSON.stringify(leads.map(l => ({ nombre: l.nombre, score: l.score, estado: l.estado })))}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
      });

      response = completion.choices[0]?.message?.content || 'No pude procesar tu mensaje.';
    }

    // Guardar respuesta del asistente
    await prisma.chatMessage.create({
      data: {
        role: 'assistant',
        content: response,
        metadata: action ? JSON.stringify(action) : null,
      },
    });

    return NextResponse.json({
      response,
      action,
      messageId: userMessage.id,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Error al procesar el mensaje', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    const messages = await prisma.chatMessage.findMany({
      where: leadId ? { leadId } : {},
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 });
  }
}

