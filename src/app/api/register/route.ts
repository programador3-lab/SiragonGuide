import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // En producción, hashea la contraseña antes de guardarla
    const user = await prisma.user.create({
      data: {
        email,
        password, // DEBES hashear esto en producción
        name,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
