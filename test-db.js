const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.productGuide.findFirst({
    where: { sku: 'MHG-554' }
  });
  console.log("Product:", JSON.stringify(product, null, 2));

  if (product && (!product.guideMedia || product.guideMedia.length === 0)) {
    console.log("Updating product to add dummy media...");
    await prisma.productGuide.update({
      where: { id: product.id },
      data: {
        guideMedia: [
          { name: 'guia-1.jpg', type: 'image', base64: 'https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png' }
        ],
        tipsMedia: [
          { name: 'tip-1.mp4', type: 'video', base64: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    });
    console.log("Updated!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
