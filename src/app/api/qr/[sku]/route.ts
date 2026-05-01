import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request, { params }: { params: { sku: string } }) {
  const { sku } = params;
  
  if (!sku) {
    return new NextResponse("Falta el parámetro SKU", { status: 400 });
  }

  try {
    // Construir la URL completa para la guía del producto
    const origin = new URL(req.url).origin;
    const productUrl = `${origin}/?sku=${encodeURIComponent(sku)}`;

    // Generar el código QR como buffer de imagen PNG
    const qrBuffer:any = await QRCode.toBuffer(productUrl, {
      type: "png",
      margin: 1,
      width: 600,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // Retornar la imagen con los headers correctos
    return new NextResponse(qrBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    });
  } catch (error) {
    console.error("Error generando QR:", error);
    return new NextResponse("Error interno al generar el QR", { status: 500 });
  }
}
