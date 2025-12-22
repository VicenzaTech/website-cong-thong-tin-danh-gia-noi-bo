# Data Fetching Patterns

## Server Actions vs Server Components

### When to use Server Actions (use server)
- For mutations (Create, Update, Delete operations)
- For operations that need to be called from Client Components
- When you need form handling with progressive enhancement

### When to use Server Components
- For data fetching on initial page load
- When you want automatic request deduplication
- For SEO-friendly content

## Examples

### Pattern 1: Server Component with Direct Data Fetch
```typescript
// app/users/page.tsx
import { getAllUsers } from "@/actions/users";

export default async function UsersPage() {
  const result = await getAllUsers();
  
  if (!result.success) {
    return <ErrorMessage message={result.error} />;
  }
  
  return <UsersList users={result.data} />;
}
```

### Pattern 2: Client Component with useEffect
```typescript
"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/actions/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <Loading />;
  return <UsersList users={users} />;
}
```

### Pattern 3: Form Actions
```typescript
"use client";

import { createUser } from "@/actions/users";

export default function CreateUserForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createUser({
      maNhanVien: formData.get("maNhanVien") as string,
      // ... other fields
    });
    
    if (result.success) {
      // Handle success
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

## Migration Guide

### Old Mock Service Pattern
```typescript
const users = await mockService.users.getAll();
```

### New Server Action Pattern
```typescript
const result = await getAllUsers();
if (result.success) {
  const users = result.data;
}
```

## Key Differences
1. Server actions return `{ success, data?, error? }` format
2. No fake delays - real database queries
3. Automatic error handling with try-catch in actions
4. Type safety with Prisma generated types

