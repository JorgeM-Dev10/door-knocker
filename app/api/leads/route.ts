import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { score: 'desc' },
      include: {
        contacts: true,
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Error al obtener leads' }, { status: 500 });
  }
}

// POST - Crear un nuevo lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.create({
      data: {
        nombre: body.nombre,
        industria: body.industria,
        direccion: body.direccion,
        lat: body.lat,
        lng: body.lng,
        score: body.score,
        estado: body.estado || 'Nuevo',
        email: body.email,
        telefono: body.telefono,
        notas: body.notas,
      },
    });
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Error al crear lead' }, { status: 500 });
  }
}

