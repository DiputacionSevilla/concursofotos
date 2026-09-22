# Memoria del Proyecto — Indice

> Archivos organizados por carpeta (tipo). Max 200 lineas.
> Gestionado por skill memory-manager. Auto-memory de Claude Code DESACTIVADO.

## user/ — Sobre el usuario/equipo
(vacio)

## project/ — Proyectos y decisiones activas
- [Concurso de Fotografía Mairena del Alcor](project/concurso-fotografia.md) — **YA DESPLEGADO** en `concursofotos.mairenadelalcor.net`, repo en GitHub (`DiputacionSevilla/concursofotos`). Auth por email+contraseña, panel admin completo en `/admin`, recuperación de contraseña por código OTP de 6 dígitos, y desde 2026-09-22 alta de participante + foto en una sola pantalla sin registro previo (`/enviar-foto`). **Pendiente desplegar en el servidor los commits `74a256d`/`41a1eac`** (ya en GitHub, falta el `git pull` manual en el CPD). `modo_pruebas` sigue ACTIVADO en BD — recordar desactivarlo antes del concurso real.

## feedback/ — Correcciones y preferencias
- [No usar listas de exclusión manuales al empaquetar/copiar el proyecto](feedback/no-listas-exclusion-manuales.md) — incidente real: se filtró un token de Supabase (`.mcp.json`) a un servidor remoto por armar un `tar --exclude` a mano en vez de derivarlo de `.gitignore`/`.dockerignore`. Ya remediado, pero aplicar la regla siempre.

## reference/ — Donde encontrar cosas
- [Docker: build, env vars y despliegue al CPD](reference/docker-deploy-cpd.md) — build-args vs runtime env de Next.js, gotcha del healthcheck con `localhost`/IPv6, por qué `package-lock.json` debe ir versionado, cómo se automatizó SSH sin `sshpass` en Windows.
- [Claude Code bloquea SSH saliente a producción](reference/ssh-deploy-bloqueado.md) — el agente no puede conectar por SSH con contraseña a un servidor remoto, ni auto-concederse ese permiso; ni el canal `!` del chat sirve para teclear contraseñas (sin tty). Aplica a cualquier proyecto: no planificar despliegues donde Claude ejecuta SSH remoto, dar la lista de ficheros/comandos para que el usuario lo haga él mismo.
- [Chrome: checkboxes/radios controlados necesitan click real](reference/chrome-testing-inputs-controlados.md) — `form_input` no dispara `onChange` de React en checkboxes/radios (sí en texto/fecha); usar `computer` con `left_click`. Aplica a cualquier proyecto probado con las tools de Claude in Chrome.
