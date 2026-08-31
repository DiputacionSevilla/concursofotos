# Guía de Despliegue en Producción (Docker)

Esta guía detalla el procedimiento para subir a producción las actualizaciones y modificaciones realizadas en el proyecto **Concurso Fotográfico Mairena del Alcor**, desplegado mediante Docker en el servidor de producción con IP **`10.158.0.3`**.

---

## 1. Arquitectura de Despliegue

- **Servidor Objetivo:** IP `10.158.0.3`
- **Puerto del Contenedor:** `3000` (`http://10.158.0.3:3000`)
- **Motor de Contenedores:** Docker & Docker Compose
- **Estrategia de Build:** Multi-stage build en Next.js con salida `standalone` en Node 22 Alpine.

> [!IMPORTANT]
> **Variables de tiempo de compilación vs. ejecución:**
> Las variables con prefijo `NEXT_PUBLIC_*` se incrustan en el cliente durante el proceso de **build** de Next.js. Por ello, se pasan como argumentos de construcción (`build args`) a través de `docker-compose.yml`.

---

## 2. Requisitos Previos

1. **Acceso SSH** a la máquina servidor (`10.158.0.3`).
2. **Docker y Docker Compose** instalados en el servidor.
3. Archivo `.env` configurado en el servidor con los valores de producción:

```bash
# Variables incrustadas en tiempo de build
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
NEXT_PUBLIC_SITE_URL=https://<tu-dominio-o-ip>

# Variables de tiempo de ejecución
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
RESEND_API_KEY=<tu-resend-key>
```

---

## 3. Procedimiento Paso a Paso (Método Recomendado: Git + SSH)

### Paso 1: Validación Local
Antes de subir los cambios, asegura la integridad del código en tu equipo de desarrollo:

```bash
# 1. Comprobar errores de TypeScript
npm run typecheck

# 2. (Opcional) Probar el build de Next.js
npm run build
```

### Paso 2: Subir Cambios al Repositorio (Git)
Una vez validados los cambios localmente, súbelos a tu repositorio remoto:

```bash
git add .
git commit -m "feat/fix: descripción de las modificaciones realizadas"
git push origin main
```

### Paso 3: Conectar al Servidor de Producción
Abre una terminal y conéctate a la máquina `10.158.0.3` vía SSH:

```bash
ssh usuario@10.158.0.3
```

### Paso 4: Descargar la Última Versión del Código
Navega al directorio del proyecto en el servidor y descarga las actualizaciones:

```bash
cd /ruta/hacia/mairena-concurso-foto
git pull origin main
```

### Paso 5: Reconstruir la Imagen Docker
Reconstruye la imagen pasando las variables de entorno para que Next.js compile los valores de producción:

```bash
docker compose build --no-cache web
```

### Paso 6: Reiniciar el Servicio sin Caída Prolongada
Reemplaza el contenedor anterior por la nueva versión recién compilada:

```bash
docker compose up -d web
```

---

## 4. Método Alternativo: Despliegue por Transferencia Directa de Imagen (`docker save / load`)

Si el servidor de producción no dispone de acceso a Git o internet para descargar paquetes durante el build:

### En tu Máquina Local:
```bash
# 1. Construir la imagen localmente especificando los argumentos de build
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://tu-supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key" \
  --build-arg NEXT_PUBLIC_SITE_URL="http://10.158.0.3:3000" \
  -t mairena-concurso-foto:latest .

# 2. Exportar la imagen comprimida
docker save mairena-concurso-foto:latest | gzip > mairena-concurso-foto.tar.gz

# 3. Transferir el archivo comprimido a la máquina 10.158.0.3
scp mairena-concurso-foto.tar.gz usuario@10.158.0.3:/home/usuario/
```

### En el Servidor (`10.158.0.3`):
```bash
# 1. Cargar la nueva imagen en Docker
docker load < mairena-concurso-foto.tar.gz

# 2. Reiniciar el contenedor usando docker-compose
docker compose up -d web

# 3. Borrar el archivo tar.gz transferido
rm mairena-concurso-foto.tar.gz
```

---

## 5. Verificación y Monitoreo post-Despliegue

### 1. Inspeccionar Estado de los Contenedores
```bash
docker compose ps
```
Debe indicar que el contenedor `mairena-concurso-foto` está `Up` y `healthy`.

### 2. Ver Logs en Tiempo Real
```bash
docker compose logs -f web
```

### 3. Comprobar la Respuesta HTTP Local en el Servidor
```bash
curl -I http://127.0.0.1:3000
```

---

## 6. Comandos de Mantenimiento Frecuentes

- **Reiniciar el servicio:** `docker compose restart web`
- **Detener el servicio:** `docker compose down`
- **Limpiar imágenes antiguas huérfanas:** `docker image prune -f`
- **Ver uso de recursos:** `docker stats mairena-concurso-foto`
