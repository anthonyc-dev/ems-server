# Prisma Multi-File Schema Organization Guide

## Overview

This guide explains how to organize Prisma schemas into multiple files for better maintainability, collaboration, and scalability.

## Why Use Multiple Files?

### Benefits

- **Better Organization**: Each model in its own file
- **Team Collaboration**: Multiple developers can work on different models without merge conflicts
- **Maintainability**: Easier to find and modify specific models
- **Scalability**: Simple to add new models without cluttering a single file
- **Code Review**: Smaller, focused changes are easier to review

### When to Use

- Projects with 5+ models
- Team development
- Complex domain models
- Long-term maintenance projects

## Step-by-Step Migration Process

### 1. Create Base Configuration File

Create `prisma/schema/base.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

### 2. Split Models by Domain

Organize models into logical groups:

#### Example Structure:

```
prisma/schema/
├── base.prisma              # Generator & datasource
├── user.prisma             # User-related models
├── product.prisma          # Product-related models
├── order.prisma            # Order-related models
└── payment.prisma           # Payment-related models
```

### 3. Create Individual Model Files

For each model, create a separate file:

**Example: `prisma/schema/user.prisma`**

```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String
  createdAt DateTime @default(now())

  posts     Post[]
  comments  Comment[]
}

model Profile {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  bio    String?

  user   User   @relation(fields: [userId], references: [id])
}
```

### 4. Handle Relations

Relations work exactly the same across files. Prisma automatically combines all `.prisma` files:

```prisma
// In user.prisma
model User {
  posts Post[]
}

// In post.prisma
model Post {
  authorId String @db.ObjectId
  author   User   @relation(fields: [authorId], references: [id])
}
```

## Migration Process (What We Did)

### Before: Single File

```
prisma/schema/schema.prisma (89 lines)
├── Generator & Datasource
├── ClearingOfficer model
├── Permit model
├── Requirement model
├── Student model
└── StudentRequirement model
```

### After: Multiple Files

```
prisma/schema/
├── base.prisma (8 lines)
├── clearing-officer.prisma (12 lines)
├── permit.prisma (10 lines)
├── requirement.prisma (12 lines)
├── student.prisma (12 lines)
└── student-requirement.prisma (10 lines)
```

### Step-by-Step Process:

1. **Analyze Original Schema**

   - Identified 5 models
   - Mapped relationships
   - Planned file organization

2. **Create Base File**

   - Extracted generator and datasource
   - Created `base.prisma`

3. **Split Models**

   - Created individual files for each model
   - Preserved all relationships
   - Maintained field definitions

4. **Remove Original**
   - Deleted old `schema.prisma`
   - Verified no data loss

## File Naming Conventions

### Recommended Patterns:

- `base.prisma` - Generator and datasource
- `user.prisma` - User-related models
- `product.prisma` - Product-related models
- `order.prisma` - Order-related models
- `auth.prisma` - Authentication models

### Naming Rules:

- Use kebab-case: `user-profile.prisma`
- Be descriptive: `payment-method.prisma`
- Group related models: `inventory.prisma`

## Best Practices

### 1. Logical Grouping

Group related models together:

```prisma
// user.prisma
model User { ... }
model Profile { ... }
model UserSettings { ... }
```

### 2. Consistent Structure

Each file should have:

- Clear comments
- Consistent formatting
- Related models only

### 3. Import Management

No imports needed - Prisma handles everything automatically.

### 4. Version Control

- Commit each file separately for better history
- Use meaningful commit messages
- Review changes per file

## Commands After Migration

### Generate Client

```bash
npx prisma generate
```

### Database Operations

```bash
npx prisma db push
npx prisma migrate dev
```

### Studio

```bash
npx prisma studio
```

## Troubleshooting

### Common Issues:

1. **Relations Not Working**

   - Ensure model names match exactly
   - Check field types and references

2. **Generation Errors**

   - Verify all files are valid Prisma syntax
   - Check for duplicate model names

3. **Missing Models**
   - Ensure all `.prisma` files are in `prisma/schema/`
   - Check file extensions

### Validation Commands:

```bash
# Check schema validity
npx prisma validate

# Format all schema files
npx prisma format
```

## Example: Complete Migration

### Original Single File:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

### After Split:

**`prisma/schema/base.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**`prisma/schema/user.prisma`**

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}
```

**`prisma/schema/post.prisma`**

```prisma
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

## Conclusion

Multi-file Prisma schemas provide better organization and maintainability for complex projects. The migration process is straightforward and doesn't break existing functionality.

### Key Takeaways:

- ✅ No code changes needed in your application
- ✅ Relations work across files automatically
- ✅ Better organization and collaboration
- ✅ Easy to maintain and scale

### Next Steps:

1. Run `npx prisma generate` after migration
2. Test your application to ensure everything works
3. Consider adding more models as separate files
4. Establish team conventions for file organization
