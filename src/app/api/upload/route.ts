import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado. Solo admins pueden subir archivos." }, { status: 403 });
  }

  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ message: "No se encontró ningún archivo" }, { status: 400 });
    }

    // Create a safe, unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename to prevent directory traversal or special character issues
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = uniqueSuffix + "-" + safeOriginalName;

    const blob = await put(`media/${filename}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("Error subiendo archivo:", error);
    return NextResponse.json({ message: "Error al subir el archivo: " + (error.message || "Desconocido") }, { status: 500 });
  }
}
