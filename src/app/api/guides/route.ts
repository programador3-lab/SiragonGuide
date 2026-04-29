import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

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

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { productName, sku, installationImages, tips } = body ?? {};

  if (!productName || !sku) {
    return NextResponse.json(
      { message: "productName y sku son obligatorios" },
      { status: 400 }
    );
  }

  const normalizedImages = Array.isArray(installationImages)
    ? installationImages
        .map((image) => String(image || "").trim())
        .filter((image) => image.length > 0)
    : [];

  if (normalizedImages.length === 0) {
    return NextResponse.json(
      { message: "Debes agregar al menos una imagen de guia de instalacion" },
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
      installationImages: normalizedImages,
      tips: tips ? String(tips).trim() : null,
      createdById: user.id,
    },
  });

  return NextResponse.json(guide, { status: 201 });
}
