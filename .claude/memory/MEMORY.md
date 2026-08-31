# Memoria del Proyecto — Indice

> Archivos organizados por carpeta (tipo). Max 200 lineas.
> Gestionado por skill memory-manager. Auto-memory de Claude Code DESACTIVADO.

## user/ — Sobre el usuario/equipo
(vacio)

## project/ — Proyectos y decisiones activas
- [Concurso de Fotografía Mairena del Alcor](project/concurso-fotografia.md) — auth migrado a email+contraseña (magic link abandonado), panel de administración completo en `/admin` (moderación, premios, participantes, exportar CSV/ZIP, alta manual por email, modo pruebas, reiniciar sistema), página pública `/ganadores`. **Pendiente: desplegar en producción** (el código de esta última sesión aún no está en `concursofotos.mairenadelalcor.net`, el usuario lo sube manualmente por WinSCP). `modo_pruebas` quedó ACTIVADO en BD — recordar desactivarlo antes del concurso real (17-18 sept 2026).

## feedback/ — Correcciones y preferencias
- [No usar listas de exclusión manuales al empaquetar/copiar el proyecto](feedback/no-listas-exclusion-manuales.md) — incidente real: se filtró un token de Supabase (`.mcp.json`) a un servidor remoto por armar un `tar --exclude` a mano en vez de derivarlo de `.gitignore`/`.dockerignore`. Ya remediado, pero aplicar la regla siempre.

## reference/ — Donde encontrar cosas
- [Docker: build, env vars y despliegue al CPD](reference/docker-deploy-cpd.md) — build-args vs runtime env de Next.js, gotcha del healthcheck con `localhost`/IPv6, por qué `package-lock.json` debe ir versionado, cómo se automatizó SSH sin `sshpass` en Windows.
- [Claude Code bloquea SSH saliente a producción](reference/ssh-deploy-bloqueado.md) — el agente no puede conectar por SSH con contraseña a un servidor remoto, ni auto-concederse ese permiso; ni el canal `!` del chat sirve para teclear contraseñas (sin tty). Aplica a cualquier proyecto: no planificar despliegues donde Claude ejecuta SSH remoto, dar la lista de ficheros/comandos para que el usuario lo haga él mismo.
