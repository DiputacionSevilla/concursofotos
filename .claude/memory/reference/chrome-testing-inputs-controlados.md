# Automatización de Chrome: checkboxes/radios controlados de React necesitan click real

Al probar formularios con las herramientas de automatización de Chrome (`mcp__claude-in-chrome__*`):

- `form_input` funciona bien en `<input type="text">`, `type="date"`, `<textarea>`, etc. — dispara correctamente el evento que React escucha en componentes controlados (`value` + `onChange`).
- `form_input` **NO** dispara correctamente `onChange` en `<input type="checkbox">` ni `type="radio">` cuando son controlados por React (`checked` + `onChange`). El DOM se actualiza visualmente pero el estado de React nunca se entera — al enviar el formulario, React lee su propio estado (no el DOM) y lo trata como si no se hubiera marcado nada.
- Síntoma: rellenas todo con `form_input`, el screenshot muestra el checkbox/radio marcado, pero al enviar aparecen errores de validación como si estuviera vacío.
- **Solución**: para checkboxes/radios en formularios React, usar un click real — `computer` con `left_click` (o `scroll_to` + `left_click` si no está visible) — en vez de `form_input`.

Descubierto 2026-09-22 probando `PublicSubmissionForm.tsx` (checkbox "acepto las bases" y radios de categoría) en este proyecto. Aplica a cualquier proyecto con formularios React controlados.
