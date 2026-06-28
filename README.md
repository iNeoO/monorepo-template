# monorepo-template

CLI interactif qui génère un monorepo TypeScript full-stack opinionné, prêt à développer.

```bash
pnpm create @ineoo/monorepo
```

## Ce que ça génère

L'outil pose quelques questions puis assemble un monorepo pnpm avec les briques choisies :

**Backend** — [Hono](https://hono.dev) avec OpenAPI, client RPC typé et OpenTelemetry, ou aucun.

**Frontend** — React 19 avec TanStack Router, TanStack Query, Tailwind v4 et Vite, ou aucun.

**ORM** — Prisma ou Drizzle (PostgreSQL via Docker Compose), ou aucun.

**Claude Code skills** — skill optionnel `create-hono-endpoint` pour scaffolder un nouveau module API depuis Claude Code.

## Structure générée

```text
my-app/
├── apps/
│   ├── hono/          # backend Hono
│   └── react/         # frontend React
├── db/
│   └── prisma/        # ou drizzle/
├── packages/
│   ├── common/        # code partagé (types, utilitaires)
│   ├── infra/         # logger (Pino), helpers OpenAPI, OpenTelemetry
│   └── services/      # couche service (PostsService, UsersService…)
├── .claude/skills/    # skills Claude Code (si sélectionnés)
├── biome.json
├── docker-compose.yaml
└── pnpm-workspace.yaml
```

## Prérequis

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 11
- [Docker](https://www.docker.com) (si ORM sélectionné)

## Démarrage rapide

```bash
# Créer un projet
pnpm create @ineoo/monorepo

# Aller dans le projet
cd my-app

# (si ORM) Configurer la base de données
cp .env.example .env   # remplir les valeurs
docker compose up -d
pnpm prisma:migrate    # ou drizzle:push
pnpm prisma:generate   # ou drizzle:generate

# Lancer le dev
pnpm dev
```

## Scripts racine disponibles

| Script | Description |
| --- | --- |
| `pnpm dev` | Build des libs puis lance tous les apps en dev |
| `pnpm hono:dev` | Lance le backend Hono |
| `pnpm react:dev` | Lance le frontend React |
| `pnpm prisma:migrate` | Applique les migrations Prisma |
| `pnpm drizzle:push` | Synchronise le schéma Drizzle |

## Développement du CLI

```bash
# Build
pnpm build

# Watch
pnpm dev

# Lint
pnpm lint
```

## Stack technique

| Couche | Choix |
| --- | --- |
| Package manager | pnpm 11 + workspaces |
| Langage | TypeScript 6 |
| Linter / Formatter | Biome 2 |
| Backend | Hono 4 + hono-openapi + @hono/node-server |
| Frontend | React 19 + TanStack Router/Query + Tailwind 4 + Vite 8 |
| ORM | Prisma 7 ou Drizzle 1 (PostgreSQL) |
| Logging | Pino |
| Tests | Vitest |
| Validation | Zod 4 |
