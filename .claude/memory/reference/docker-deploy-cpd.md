# Docker: build, env vars y despliegue al CPD (aplica a este proyecto y a cualquier SaaS Factory dockerizado)

## Estructura
- `Dockerfile`: 3 stages (`deps` → `builder` → `runner`), `node:22-alpine`, usa `output: 'standalone'` de Next.js (imprescindible: sin esto `.next/standalone` no existe y el Dockerfile falla).
- `docker-compose.yml`: un único servicio `web`. Sin base de datos propia ni proxy propio en el compose — el backend es Supabase (nube) y ya existe un proxy inverso en el CPD delante (decisión confirmada con el usuario vía `AskUserQuestion`, no asumida).
- `.env.example`: plantilla de lo que hace falta rellenar en el servidor real.

## Variables de entorno: build-time vs runtime (el punto que más se rompe)
Next.js incrusta (`inline`) las variables `NEXT_PUBLIC_*` en el bundle del navegador **en tiempo de build**, no de arranque. Pero algunas de esas mismas variables también se leen en el servidor en tiempo de **runtime** (Server Components, Route Handlers, y `next.config.ts` que se evalúa cada vez que arranca el proceso `next start`/`node server.js`).

En este proyecto: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` se usan en `lib/supabase/client.ts` (browser, necesita build-time) Y en `lib/supabase/server.ts`/`admin.ts` (servidor, necesita runtime) Y en `next.config.ts` (`images.remotePatterns`, runtime). **Conclusión: hay que pasarlas COMO build ARG (para que se incrusten) Y COMO variable de entorno del contenedor en runtime (para que el servidor y `next.config.ts` las vean al arrancar).** El `docker-compose.yml` de este proyecto las declara duplicadas a propósito en `build.args` y en `environment` — no es un error, es necesario.

`SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` NO llevan `NEXT_PUBLIC_`, así que nunca se incrustan en el bundle — solo hace falta pasarlas en runtime (`environment`), nunca como build arg.

`NEXT_PUBLIC_SITE_URL` solo se usa client-side (`magic-link.ts`) con fallback `|| window.location.origin`. Se puede dejar vacía en el build/deploy sin romper nada — el navegador usará su propio origin real. Útil cuando aún no se conoce el dominio final en el momento del build.

## next.config.ts portable entre entornos
El host permitido para `next/image` (`images.remotePatterns`) se deriva de `new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname` en vez de estar hardcodeado con el ref del proyecto Supabase. Así la misma imagen/Dockerfile sirve para cualquier proyecto Supabase sin tocar código, solo cambiando el `.env`.

## package-lock.json debe estar versionado
El scaffold de SaaS Factory trae `package-lock.json` en `.gitignore` por defecto. Para Docker esto es un problema: `npm ci` (usado en el Dockerfile por ser reproducible y más rápido que `npm install`) **exige que el lockfile exista y esté sincronizado con `package.json`**. Hay que quitar `package-lock.json` de `.gitignore` y trackearlo ANTES de dockerizar cualquier proyecto de esta fábrica.

## Gotcha real encontrado: healthcheck con `localhost` falla aunque la app funcione
Si el `HEALTHCHECK`/healthcheck de compose usa `wget http://localhost:3000/` dentro de un contenedor `node:XX-alpine`, BusyBox `wget` puede resolver `localhost` primero a `::1` (IPv6). El servidor standalone de Next.js, cuando se le pasa `HOSTNAME=0.0.0.0` (el valor recomendado para Docker), **solo escucha en IPv4** — así que el healthcheck falla con "Connection refused" y el contenedor queda marcado `unhealthy` aunque `curl`/el navegador funcionen perfectamente desde fuera (porque esas herramientas sí prueban IPv4).

**Fix:** usar `http://127.0.0.1:3000/` en el healthcheck, nunca `localhost`. Ya corregido en el `docker-compose.yml` de este repo — replicar en cualquier otro proyecto SaaS Factory dockerizado con este mismo patrón de Dockerfile.

## Despliegue sin `sshpass`/`plink` disponibles (máquina Windows sin esas herramientas)
Cuando el entorno de trabajo es Windows y solo hay OpenSSH cliente nativo (sin `sshpass` ni PuTTY), no hay forma limpia de automatizar `ssh`/`scp` con autenticación por password de forma no interactiva. Solución usada: `npm install node-ssh` en un directorio temporal (scratchpad, fuera del repo del proyecto) y un script Node.js puntual que usa `NodeSSH.connect({password})` + `execCommand`/`putFile`. Funciona bien, es pure-JS (no requiere compilación nativa). **Borrar el script y cualquier archivo con el password/tokens en cuanto termine el despliegue** — no dejarlos en el scratchpad ni, sobre todo, en el repo.

## Empaquetado del código para subir a un servidor remoto: usar SIEMPRE las exclusiones ya definidas
Ver `feedback/no-listas-exclusion-manuales.md` — no crear una lista de exclusión de `tar`/`scp` a mano; se corre el riesgo de incluir un archivo con secretos que sí está en `.gitignore`/`.dockerignore` pero presente en disco (p.ej. `.mcp.json`). Derivar la exclusión de esos archivos existentes, no reinventarla.
