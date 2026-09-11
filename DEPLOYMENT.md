# Despliegue en Vercel con dominio de SiteGround

Este proyecto es una app Next.js con rutas API, NextAuth, Prisma y MySQL. No puede subirse como sitio estatico a `public_html`, porque necesita un runtime Node.js para login, dashboard, CRUD, QR y uploads.

SiteGround indica en su KB que sus planes Shared y Cloud no soportan Node.js. En este setup, Vercel ejecuta la app Next.js y SiteGround se usa para:

- Dominio/DNS.
- Base de datos MySQL.

Importante: Vercel no es un disco persistente para uploads locales. Los archivos que ya estan en `public/uploads` se desplegaran con el repo, pero los archivos nuevos subidos desde `/api/upload` deben moverse a Vercel Blob, S3 u otro storage externo para que sean persistentes en produccion.

La ruta `/api/upload` ya esta preparada para S3. En Vercel no intenta escribir en disco.

## Variables de entorno

Configura estas variables en Vercel, dentro del proyecto en Settings > Environment Variables:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE?sslaccept=accept_invalid_certs"
NEXTAUTH_SECRET="generate-a-long-random-secret"
NEXTAUTH_URL="https://guia.siragon.com"
NEXT_PUBLIC_BASE_URL="https://guia.siragon.com"

AWS_REGION="us-east-2"
AWS_S3_BUCKET="siragon-media-2026"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_PUBLIC_URL="https://siragon-media-2026.s3.us-east-2.amazonaws.com"
```

Para generar `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Uploads con S3

Necesitas un bucket S3 para guardar imagenes y videos.

Variables:

```env
AWS_REGION="us-east-2"
AWS_S3_BUCKET="siragon-media-2026"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_PUBLIC_URL="https://siragon-media-2026.s3.us-east-2.amazonaws.com"
```

`AWS_S3_PUBLIC_URL` puede ser la URL publica del bucket o una URL de CloudFront si usas CDN.

El bucket debe permitir lectura publica de los objetos, o las imagenes/videos no se veran en la pagina publica. Si el bucket tiene bloqueada toda lectura publica, el upload puede funcionar pero la URL guardada no cargara en el navegador.

Los archivos se suben directo desde el navegador a S3 con una presigned URL, asi no pasan por Vercel (que limita cada peticion a ~4.5 MB). Para eso el bucket necesita CORS. En S3 > bucket > Permissions > Cross-origin resource sharing (CORS):

```json
[
  {
    "AllowedOrigins": ["https://guia.siragon.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

Si falta el CORS, la app intenta subir el archivo a traves del servidor como respaldo. Eso solo funciona con archivos de hasta ~4 MB, asi que los videos grandes fallaran hasta que se configure el CORS.

`AWS_S3_BUCKET_NAME` tambien se acepta como nombre alternativo de `AWS_S3_BUCKET`.

## Deploy en Vercel

1. Sube este repositorio a GitHub, GitLab o Bitbucket.
2. En Vercel, crea un proyecto nuevo e importa el repositorio.
3. Framework Preset: Next.js.
4. Build Command: `npm run build`.
5. Install Command: `npm ci`.
6. Agrega las variables de entorno.
7. Deploy.

## Dominio de SiteGround en Vercel

1. En Vercel, entra al proyecto > Settings > Domains.
2. Agrega el dominio `guia.siragon.com`.
3. Vercel mostrara los registros DNS exactos que debes colocar.
4. En SiteGround, ve a Site Tools > Domain > DNS Zone Editor.
5. Normalmente usaras:

```txt
Tipo: CNAME
Nombre: guia
Valor: el valor CNAME que indique Vercel
```

Usa el valor que muestre Vercel en pantalla, porque algunos proyectos pueden recibir un CNAME unico.

Si el dominio ya tiene correo en SiteGround, no borres los registros MX ni TXT de email. Solo cambia/agrega los registros necesarios para web.

## Build local

```bash
npm ci
npm run build
npm start
```

El proyecto usa `output: "standalone"` en `next.config.mjs`, util para hostings Node y despliegues tipo servidor.

No subas la `.env` local generada en tu maquina. En produccion, las variables deben configurarse en el panel del hosting.

## Base de datos

Antes de arrancar la app en produccion, sincroniza Prisma con la base:

```bash
npm run db:push
```

Si la base esta vacia, tambien necesitas crear al menos un usuario `ADMIN` en la tabla `user` para entrar al dashboard.
