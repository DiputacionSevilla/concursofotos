# BUSINESS_LOGIC.md - Concurso de Fotografía Día Mundial del Turismo (Mairena del Alcor)

> Generado por SaaS Factory | Fecha: 2026-08-24

## 1. Problema de Negocio
**Dolor:** El Ayuntamiento de Mairena del Alcor no dispone de un canal digital centralizado para organizar su concurso de fotografía con motivo del Día Mundial del Turismo. Hoy la inscripción y recepción de fotos sería manual (email/papel), lenta, sin garantía de que las fotos no se pierdan, y sin una vía atractiva para informar del concurso ni mostrar los resultados al público.

**Costo actual:** Riesgo de pérdida de material de participantes, nula visibilidad del concurso, mala experiencia para participantes no técnicos, imposibilidad de mostrar resultados de forma vistosa.

## 2. Solución
**Propuesta de valor:** Una plataforma web con impacto visual que sirve como canal único de información, inscripción y participación del concurso de fotografía, y como escaparate final de resultados.

**Flujo principal (Happy Path):**
1. El participante visita la web → ve info del concurso, bases, cronograma, escudo oficial del Ayuntamiento
2. Se registra con su correo electrónico (magic link, sin contraseña)
3. Sube su(s) foto(s) de participación con título/descripción, aceptando las bases
4. El sistema valida y almacena la foto de forma segura (Supabase Storage + copia de seguridad secundaria) y confirma por email
5. El Ayuntamiento (admin) modera las fotos recibidas desde un panel privado
6. Al finalizar el concurso, se publican los resultados/ganadores en una galería pública

## 3. Usuario Objetivo
**Roles:**
- **Participante:** ciudadano o turista aficionado a la fotografía, perfil no técnico, mayoritariamente desde móvil.
- **Admin (Ayuntamiento / Oficina de Turismo):** modera fotos, gestiona bases y fechas, publica resultados.
- **Público general:** visita la web para informarse del concurso y, al final, ver la galería de resultados.

**Contexto:** Uso estacional (World Tourism Day, finales de septiembre), pico de tráfico corto pero relevante para la imagen institucional. Debe funcionar perfecto en móvil.

## 4. Arquitectura de Datos
**Input:**
- Email del participante (registro / login)
- Nombre y apellidos
- Teléfono (opcional)
- Foto(s) de participación (JPEG/PNG)
- Título y descripción breve de cada foto
- Aceptación de bases legales (checkbox obligatorio)

**Output:**
- Email de confirmación de registro y de recepción de foto
- Galería pública de participantes (según se decida en las bases: visible desde el envío o solo al final)
- Página de resultados / ganadores
- Panel admin: listado de participantes y fotos, estado de moderación (pendiente/aprobada/rechazada/ganadora)

**Storage (Supabase tables sugeridas):**
- `profiles`: id, email, nombre, apellidos, telefono, created_at
- `submissions`: id, participant_id (FK), storage_path, title, description, status (pending/approved/rejected/winner), created_at
- `contest_config`: fechas de apertura/cierre, nº máximo de fotos por participante, tamaño máx., texto de bases — **PENDIENTE de rellenar cuando lleguen las bases oficiales**
- Supabase Storage bucket `contest-photos` (privado) con RLS:
  - Un participante solo puede subir y ver sus propias fotos
  - El admin puede ver/moderar todas
  - El público solo ve las fotos marcadas como aprobadas/visibles

## 5. KPI de Éxito
**Métrica principal:** Un participante puede registrarse y subir su foto en menos de 2 minutos desde el móvil, sin fricción, y **cero fotos perdidas** (verificado con copia de seguridad secundaria fuera de Supabase).

## 6. Especificación Técnica (Para el Agente)

### Features a Implementar (Feature-First)
```
src/features/
├── auth/            # Registro/login por Magic Link (Supabase, sin password ni OAuth)
├── contest-info/     # Landing informativa: bases, cronograma, escudo oficial, impacto visual
├── submissions/       # Subida y gestión de fotos del participante (upload seguro + validación)
├── gallery/           # Galería pública / resultados finales
└── admin/             # Panel de moderación y publicación de resultados (ruta protegida)
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui
- **Backend:** Supabase (Auth Magic Link + Database + Storage + RLS)
- **Validación:** Zod (tipo/tamaño de archivo, campos de formulario)
- **State:** Zustand (progreso de subida, formularios)
- **MCPs:** Next.js DevTools + Playwright + Supabase
- **Backup de fotos:** copia secundaria fuera de Supabase Storage (los backups de BD de Supabase NO incluyen los ficheros subidos) — pendiente de decidir mecanismo (ver memoria del proyecto)

### Próximos Pasos
1. [x] Setup proyecto base (Golden Path scaffolding)
2. [x] Crear proyecto Supabase y configurar `.env.local`
3. [x] Implementar Auth (Magic Link) — login en 2 pasos (email → completar perfil la primera vez), SMTP propio con Resend configurado
4. [x] Feature: contest-info (landing + escudo oficial + bases)
5. [x] Feature: submissions (subida de fotos + validación) — confirmación por email pendiente (ver nota abajo)
6. [x] Configurar Storage bucket + RLS — estrategia de backup secundario sigue pendiente de decidir
7. [x] Feature: gallery (resultados finales)
8. [x] Feature: admin (moderación + configuración del concurso)
9. [ ] Testing E2E (Playwright) — smoke test manual hecho; falta cobertura del flujo completo (subida, moderación, galería) con sesión real
10. [x] Deploy — NO en Vercel (decisión del usuario): dockerizado y desplegado en infraestructura propia del Ayuntamiento (CPD, `10.158.0.3`, `/opt/webfotos`, contenedor `mairena-concurso-foto`). Ver `.claude/memory/project/concurso-fotografia.md` (sección 2026-08-27) y `.claude/memory/reference/docker-deploy-cpd.md` para el detalle completo. Pendiente de terceros: proxy inverso del CPD apuntando al subdominio final + añadir ese subdominio a Supabase Auth Redirect URLs.

**Nota:** el envío de "email de confirmación de recepción de foto" (mencionado en la sección 4, Output) no está implementado todavía — de momento solo existe el email de magic link. Se abordaría con el skill `add-emails` reutilizando el `RESEND_API_KEY` ya configurado en `.env.local`.

### Bases oficiales integradas (2026-08-27)
Recibido el borrador de bases legales ("I Concurso Fotográfico de Mairena del Alcor — Día
Internacional del Turismo 2026"). Decisión con el usuario: **el canal de participación es esta
plataforma web** (sube tu foto directamente), no el email que mencionaba el borrador original —
por eso se construyó la app. El texto de las bases (`contest_config.bases_texto`) se adaptó para
reflejarlo; el resto del contenido legal se mantiene fiel al documento original.

- Nº máximo de fotos por participante: **1** (`max_fotos_por_participante = 1`)
- Formatos/tamaño: JPG o PNG, máx. **5 MB** (`tamano_max_mb = 5`)
- Fechas: hacer fotos hasta 16/09/2026, subir foto 17–18/09/2026, ganadores 26/09/2026
  (`fecha_limite_fotos`, `fecha_apertura`/`fecha_cierre`, `fecha_anuncio_ganadores`)
- Galería pública solo al cerrar el plazo (`galeria_publica_desde_envio = false`)
- Edad mínima 6 años, dos grupos: Infantil/Juvenil (6-17, requiere tutor) y Adultos (18+)
  (`edad_minima = 6`; `profiles.fecha_nacimiento`, `tutor_nombre`, `tutor_dni` nuevos)
- 3 categorías temáticas por foto: paisajes / patrimonio / rincón por descubrir
  (`submissions.categoria`, nuevo)
- Premios: trofeo + exposición temporal (1º puesto), diploma + exposición (finalistas 2º-3º),
  por categoría y grupo de edad. Jurado: fotógrafos locales + Técnico de Turismo, anónimo.
- Pendiente de confirmar por el Ayuntamiento antes de publicar: el texto de bases es un borrador
  adaptado, no la versión legal definitiva — revisar antes de la apertura del concurso.

---
*"Primero entiende el negocio. Después escribe código."*
