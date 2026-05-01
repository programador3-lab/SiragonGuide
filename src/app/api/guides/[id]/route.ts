import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado. Solo admins pueden modificar." }, { status: 403 });
  }

  const { id } = params;
  if (!id) return NextResponse.json({ message: "ID no válido" }, { status: 400 });

  try {
    const body = await req.json();
    const { productName, sku, productPhoto, guideMedia, tipsMedia } = body ?? {};

    const guideId = parseInt(id, 10);

    const guide = await prisma.productGuide.findUnique({
      where: { id: guideId },
      include: { createdBy: true },
    });

    if (!guide) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    const updated = await prisma.productGuide.update({
      where: { id: guideId },
      data: {
        productName: productName !== undefined ? String(productName).trim() : guide.productName,
        sku: sku !== undefined ? String(sku).trim() : guide.sku,
        productPhoto: productPhoto !== undefined ? productPhoto : guide.productPhoto,
        guideMedia: guideMedia !== undefined ? guideMedia : guide.guideMedia,
        tipsMedia: tipsMedia !== undefined ? tipsMedia : guide.tipsMedia,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json({ 
      message: "Error al actualizar el producto: " + (error.message || "Error desconocido") 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado. Solo admins pueden eliminar." }, { status: 403 });
  }

  const { id } = params;
  if (!id) return NextResponse.json({ message: "ID no válido" }, { status: 400 });

  const guideId = parseInt(id, 10);

  const guide = await prisma.productGuide.findUnique({
    where: { id: guideId },
    include: { createdBy: true },
  });

  if (!guide) {
    return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  }

  // Los admins pueden eliminar cualquier guía
  // if (guide.createdBy.email !== session.user.email) {
  //   return NextResponse.json({ message: "Prohibido" }, { status: 403 });
  // }

  await prisma.productGuide.delete({
    where: { id: guideId },
  });

  return NextResponse.json({ message: "Eliminado exitosamente" });
}
