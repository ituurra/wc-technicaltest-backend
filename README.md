# Backend API — GitHub Metrics (NestJS + arquitectura hexagonal)

API REST que consulta la API pública de GitHub (`/users/{username}` y `/users/{username}/repos`) y expone perfiles resumidos y métricas derivadas, con caché en memoria (TTL 5 minutos), validación de entradas y manejo de errores 404 / 429 / 503.

## Requisitos

- Node.js 22 (recomendado: `.nvmrc` en el monorepo o `nvm use`)
- npm

## Configuración

Copia variables de ejemplo:

```bash
cp .env.example .env
```

| Variable        | Descripción |
|----------------|-------------|
| `PORT`         | Puerto HTTP (por defecto `3000`) |
| `USER_AGENT`   | Cabecera `User-Agent` hacia GitHub (obligatorio para la API) |
| `GITHUB_TOKEN` | Opcional: token personal para reducir límites de rate |

## Scripts

| Comando           | Uso |
|-------------------|-----|
| `npm run start:dev` | Desarrollo con recarga |
| `npm run build`     | Compilación |
| `npm run start:prod` | Producción (`node dist/main`) |
| `npm run test`      | Tests unitarios |
| `npm run test:e2e`  | Tests end-to-end |
| `npm run lint`      | ESLint con corrección automática |
| `npm run format`    | Prettier |

## Ejecutar en local

```bash
npm install
npm run start:dev
```

- API: `http://localhost:3000` (o el `PORT` configurado)

## Swagger (documentación OpenAPI)

Con la aplicación en marcha:

- **UI:** [http://localhost:3000/api](http://localhost:3000/api)

Ahí puedes probar `GET /health`, `GET /profiles/{username}` y `GET /metrics/{username}`.

## Endpoints (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio |
| `GET` | `/profiles/:username` | Perfil resumido (login, nombre, avatar, bio, repos públicos, seguidores, enlace) |
| `GET` | `/metrics/:username` | Métricas: `totalStars`, `followersToReposRatio`, `lastPushDaysAgo`, `topLanguage` |

## Ejemplos con curl

```bash
curl http://localhost:3000/health
curl http://localhost:3000/profiles/octocat
curl http://localhost:3000/metrics/octocat
```

## Docker

```bash
docker compose up --build
```

Misma API en el puerto configurado (por defecto `3000`).

## Arquitectura (hexagonal + módulo de dominio)

El proyecto está organizado por módulo de negocio (`github`) con capas hexagonales internas:

- **`src/github/domain`**: tipos, puertos (`GithubPort`, `CachePort`) y servicios puros (`computeGithubMetricsSummary`, `buildProfileSummary`).
- **`src/github/application/use-cases`**: orquestación de casos de uso, caché y logging.
- **`src/github/infrastructure/adapters/in`**: adaptadores de entrada HTTP (controllers + DTOs).
- **`src/github/infrastructure/adapters/out`**: adaptadores de salida (GitHub HTTP con Axios y caché en memoria).
- **`src/github/composition`**: tokens de DI (`GITHUB_PORT`, `CACHE_PORT`) y wiring del módulo.
- **`src/health.controller.ts`**: endpoint transversal de salud del servicio.

Elegí organizar la solución por **módulo de negocio** para mantener juntas las capas de un mismo contexto funcional y reducir acoplamiento entre features. Esta estructura facilita ubicar responsabilidades (entrada, orquestación, dominio y salida), mejora la mantenibilidad cuando crece el proyecto y permite reemplazar adaptadores (por ejemplo cache o cliente HTTP) con impacto mínimo en la lógica de negocio.

## Errores HTTP

| Código | Caso |
|--------|------|
| 404 | Usuario no existe en GitHub |
| 429 | Límite de peticiones (o respuesta equivalente de GitHub) |
| 503 | Fallo al comunicar con GitHub u otro error externo |
