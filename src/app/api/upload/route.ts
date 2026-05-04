import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ message: "Faltan datos del archivo" }, { status: 400 });
    }

    // Create a safe, unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeOriginalName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const safeFilename = uniqueSuffix + "-" + safeOriginalName;
    const s3Key = `media/${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: s3Key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({ presignedUrl, url });
  } catch (error: any) {
    console.error("Error generando presigned URL de S3:", error);
    return NextResponse.json({ message: "Error al generar URL de subida: " + (error.message || "Desconocido") }, { status: 500 });
  }
}
