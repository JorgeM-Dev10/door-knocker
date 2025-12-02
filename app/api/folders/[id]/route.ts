import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Eliminar una carpeta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mover todos los leads de esta carpeta a "sin carpeta" (null)
    await prisma.lead.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    // Eliminar la carpeta
    await prisma.folder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Error al eliminar carpeta' }, { status: 500 });
  }
}

// PUT - Actualizar una carpeta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        nombre: body.nombre,
        color: body.color,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Error al actualizar carpeta' }, { status: 500 });
  }
}

