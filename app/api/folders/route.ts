import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todas las carpetas
export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        leads: true,
      },
    });
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Error al obtener carpetas' }, { status: 500 });
  }
}

// POST - Crear una nueva carpeta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const folder = await prisma.folder.create({
      data: {
        nombre: body.nombre,
        color: body.color || null,
      },
    });
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Error al crear carpeta' }, { status: 500 });
  }
}

