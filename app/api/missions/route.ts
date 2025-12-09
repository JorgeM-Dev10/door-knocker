import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las misiones
export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: { fecha: 'desc' },
      take: 10,
    });
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Error al obtener misiones' }, { status: 500 });
  }
}

// POST - Crear una nueva misión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mission = await prisma.mission.create({
      data: {
        industria: body.industria,
        ubicacion: body.ubicacion,
        leadsCount: body.leadsCount,
      },
    });
    return NextResponse.json(mission);
  } catch (error) {
    console.error('Error creating mission:', error);
    return NextResponse.json({ error: 'Error al crear misión' }, { status: 500 });
  }
}



