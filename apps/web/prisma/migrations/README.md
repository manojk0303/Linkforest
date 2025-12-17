# Database Migrations

## Current State

The database has been reset to a clean, stable state. All migrations have been consolidated into a single initial migration.

### Migration History

- **20251217054124_init** - Initial migration containing the complete Linkforest database schema

## Schema Overview

The database includes the following models:

- **User** - User accounts with authentication, roles (USER/ADMIN), and payment status (isPaid)
- **Profile** - User profiles with slugs, themes, and customization settings
- **Link** - Links within profiles with ordering, status, and metadata
- **Analytics** - Click tracking with device type, country, and referrer data
- **Subscription** - Payment subscription management (single $5/month tier)
- **Account** - OAuth provider accounts (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification tokens (NextAuth)
- **PasswordResetToken** - Password reset tokens
- **ContactRequest** - Contact form submissions

## Running Migrations

### Development

```bash
# Apply pending migrations and regenerate Prisma Client
pnpm prisma migrate dev

# Push schema changes without creating migration
pnpm prisma db push
```

### Production

```bash
# Apply migrations (non-interactive)
pnpm prisma migrate deploy
```

## Creating New Migrations

When you make changes to `schema.prisma`:

```bash
# Create and apply a new migration
pnpm prisma migrate dev --name descriptive_name
```

## Troubleshooting

### P3006 Error (Syntax Error)

This error typically indicates corrupted migration files. If you encounter it:

1. Check the migration SQL file for non-SQL content
2. If corrupted, delete the migration folder and recreate it

### Database Out of Sync

```bash
# Check migration status
pnpm prisma migrate status

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### Connection Issues

- Ensure PostgreSQL is running: `docker compose up -d`
- Verify DATABASE_URL in `.env` file
- Check database credentials and connectivity

## Migration Reset (December 17, 2024)

The database was reset to resolve P3006 migration syntax errors caused by corrupted migration files. All previous migrations were consolidated into a single clean initial migration.

**What was done:**

1. Removed all previous migration files (4 migrations with various issues)
2. Ran `prisma migrate reset` to clean the database
3. Created fresh initial migration `20251217054124_init`
4. Verified database connection and schema validity
5. Successfully built and tested the application

**Result:** Clean, stable database state with no migration errors.
