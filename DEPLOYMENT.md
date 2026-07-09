# Despliegue en Vercel con dominio de SiteGround

Este proyecto es una app Next.js con rutas API, NextAuth, Prisma y MySQL. No puede subirse como sitio estatico a `public_html`, porque necesita un runtime Node.js para login, dashboard, CRUD, QR y uploads.

SiteGround indica en su KB que sus planes Shared y Cloud no soportan Node.js. En este setup, Vercel ejecuta la app Next.js y SiteGround se usa para:

- Dominio/DNS.
- Base de datos MySQL.

Importante: Vercel no es un disco persistente para uploads locales. Los archivos que ya estan en `public/uploads` se desplegaran con el repo, pero los archivos nuevos subidos desde `/api/upload` deben moverse a Vercel Blob, S3 u otro storage externo para que sean persistentes en produccion.

## Variables de entorno

Configura estas variables en Vercel, dentro del proyecto en Settings > Environment Variables:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE?sslaccept=accept_invalid_certs"
NEXTAUTH_SECRET="generate-a-long-random-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

Para generar `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

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
2. Agrega el dominio, por ejemplo `siragon.com`.
3. Vercel mostrara los registros DNS exactos que debes colocar.
4. En SiteGround, ve a Site Tools > Domain > DNS Zone Editor.
5. Normalmente usaras:

```txt
Tipo: A
Nombre: @
Valor: el valor A que indique Vercel para el dominio apex

Tipo: CNAME
Nombre: www
Valor: el valor CNAME que indique Vercel para www
```

Usa los valores que muestre Vercel en pantalla, porque algunos proyectos pueden recibir un CNAME unico.

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
