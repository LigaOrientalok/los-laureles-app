# Liga Oriental — Los Laureles App

**Aplicación web progresiva (PWA)** para gestión de torneos de fútbol amateur.

## Características

- **Registro de jugadores** con foto, posición, pierna y asignación a equipo
- **Equipos** con logo, tabla de posiciones por día (PTS, PJ, V, E, P, GF, GC, DF)
- **Fixture** automático por día y horario
- **Carga de resultados** con goles por jugador, tarjetas y MVP
- **Estadísticas** con gráficos (Chart.js): goleadores, ranking equipos, evolución
- **Salón de la Fama** — cartas estilo EA Sports con rating dinámico
- **Buscador de jugadores** con filtros por nombre, posición y equipo
- **Historial de torneos** — campeón, goleador y MVP de cada torneo
- **Misiones + XP + Niveles** — 75 misiones (general, campo, portero) con marcos por nivel
- **Panel Admin** — gestión de usuarios, jugadores, equipos; respaldo/recomputo de stats
- **Autenticación** por email y Google OAuth
- **PWA** — instalable con service worker y manifest.json
- **Roles**: usuario, árbitro y admin con vistas restringidas
- **Notificaciones** de nuevas funcionalidades

## Tecnología

- HTML5 + CSS3 + JavaScript vanilla
- Supabase (auth, base de datos, RLS policies)
- Chart.js para gráficos
- PWA con manifest.json + service worker
- Desplegado en Vercel

## Scripts

| Archivo | Descripción |
|---------|-------------|
| `supabase-config.js` | Cliente Supabase, utilidades (`soloAdmin`, `debounce`, `mostrarToast`) |
| `auth.js` | Login/registro por email |
| `auth-google.js` | Login con Google OAuth |
| `script-v2.js` | Lógica principal (~1334 líneas) |
| `tournaments.js` | Creación y selector de torneos |
| `stats.js` | Estadísticas y gráficos |
| `export.js` | Exportación JSON, CSV, PDF |
| `misiones.js` | Sistema de misiones/XP/niveles (75 misiones) |
| `buscador.js` | Buscador de jugadores con filtros |
| `equipos.js` | Sección equipos e historial de torneos |
| `admin-users.js` | Gestión de usuarios en panel admin |

## Entry Points

- `index-v2.html` — app principal con login email
- `index-auth-google.html` — login con Google OAuth
- `index-auth.html` — app alternativa con login email

## Licencia

Desarrollado para Liga Oriental 2026
