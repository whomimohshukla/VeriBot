# Migrations

The source of truth for the schema is `prisma/schema.prisma`.

## Generate the real DDL

```bash
npm run prisma:migrate -- --name init
```

`init.sql` documents the core relational shape and can be used for raw-DDL
databases, but you should rely on Prisma Migrate so migrations stay versioned
under `prisma/migrations/`.

## Deploying to a database

```bash
npm run prisma:deploy    # applies all migrations without dev prompts
```