import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  // GET es público ahora para que la página oficial pueda leer las guías
  const guides = await prisma.productGuide.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(guides);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado. Solo admins pueden publicar." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { productName, sku, productPhoto, guideMedia, tipsMedia } = body ?? {};

    if (!productName || !sku) {
      return NextResponse.json(
        { message: "productName y sku son obligatorios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const guide = await prisma.productGuide.create({
      data: {
        productName: String(productName).trim(),
        sku: String(sku).trim(),
        productPhoto: productPhoto || null,
        guideMedia: guideMedia || [],
        tipsMedia: tipsMedia || [],
        createdById: user.id,
      },
    });

    return NextResponse.json(guide, { status: 201 });
  } catch (error: any) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ 
      message: "Error al crear el producto: " + (error.message || "Error desconocido") 
    }, { status: 500 });
  }
}
