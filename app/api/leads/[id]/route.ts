import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener un lead específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
        chatMessages: true,
      },
    });
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Error al obtener lead' }, { status: 500 });
  }
}

// PUT - Actualizar un lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        industria: body.industria,
        direccion: body.direccion,
        lat: body.lat,
        lng: body.lng,
        score: body.score,
        estado: body.estado,
        email: body.email,
        telefono: body.telefono,
        notas: body.notas,
      },
    });
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Error al actualizar lead' }, { status: 500 });
  }
}

// DELETE - Eliminar un lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Lead eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Error al eliminar lead' }, { status: 500 });
  }
}

