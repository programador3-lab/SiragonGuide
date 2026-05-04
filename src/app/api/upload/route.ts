import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe, unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = uniqueSuffix + "-" + safeOriginalName;
    const s3Key = `media/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      // ACL: 'public-read' // Opcional, dependiendo de la configuración de tu bucket
    });

    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Error subiendo archivo a S3:", error);
    return NextResponse.json({ message: "Error al subir el archivo: " + (error.message || "Desconocido") }, { status: 500 });
  }
}
