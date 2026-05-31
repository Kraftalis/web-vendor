---
name: frontend-refactor
description: "Frontend code refactoring guide for web-vendor. Enforces: max 300-line files, single-responsibility children, Zustand for shared state, HeroUI v3 modals, unified create/edit modal mode, hooks→services→api-route data flow, react-query with keys in /src/constants/query-key.ts, and unused-file quarantine. Keywords: refactor, component, modal, react-query, hooks, services, zustand, split, optimize, unused."
metadata:
  author: kraftalis
  version: "1.2.0"
---

# Frontend Refactor Guide — web-vendor

---

## Rule 1 — Max 300 Lines Per File

Every `.tsx` / `.ts` file must not exceed **300 lines**.

How to split:

- Extract JSX sections into named child components (→ Rule 2).
- Extract utility functions (formatters, mappers, constants) into a co-located `utils.ts`.
- Extract types/interfaces into a co-located `types.ts`.
- Extract heavy component logic (hooks, handlers, derived state) into a co-located `use-{component-name}.ts` hook.

---

## Rule 2 — Child Components & Single Responsibility

Each component must have one clear responsibility. Large parent components must be broken into named children.

### Shared State Across Children

Do NOT prop-drill more than 1 level deep. When 2+ sibling/nested children need to share state, create a Zustand store:

```typescript
// /src/stores/{domain}-store.ts
import { create } from "zustand";

interface ExampleState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));
```

Reference stores to follow:

- `/src/stores/schedule-store.ts` — complex state with derived navigation
- `/src/stores/sidebar-store.ts` — minimal toggle pattern

---

## Rule 3 — File Placement

| Scenario                               | Location                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Child used only by one parent template | Same folder as parent, e.g. `/src/templates/event/event-list-item.tsx` |
| Shared across 2+ pages or templates    | `/src/components/{category}/{component-name}.tsx`                      |
| Domain store                           | `/src/stores/{domain}-store.ts`                                        |
| Co-located utilities                   | `{parent-folder}/utils.ts`                                             |
| Co-located types                       | `{parent-folder}/types.ts`                                             |
| Co-located hook                        | `{parent-folder}/use-{name}.ts`                                        |

Existing `/src/components/` categories to reuse or extend:

- `ui/` — generic UI primitives (inputs, buttons, badges, skeletons)
- `layout/` — app shell, sidebar, topbar
- `form/` — form building blocks
- `dashboard/` — stat cards, KPI displays
- `icons/` — icon wrappers

---

## Rule 4 — Performance Optimizations

Apply selectively — only where renders are genuinely expensive:

1. **`React.memo`** — wrap child components with stable props that render often.
2. **`useMemo`** — memoize expensive computations (data aggregations, chart transformations, filtered/sorted lists).
3. **`useCallback`** — memoize event handlers passed as props to memoized children.
4. **No inline objects/arrays in JSX** — extract outside render or use `useMemo`.
5. **`React.lazy` + `Suspense`** — lazy-load heavy conditionally-rendered sections (charts, rich text editors).

```tsx
// Good: memoized derived data
const stats = useMemo(() => computeStats(events), [events]);

// Good: stable callback for memoized child
const handleDelete = useCallback(
  (id: string) => {
    deleteEvent(id);
  },
  [deleteEvent],
);

// Good: lazy-loaded heavy component
const RichEditor = React.lazy(() => import("@/components/ui/rich-text-editor"));
```

---

## Rule 5 — All Modals Must Use HeroUI v3

**When refactoring a folder, ALL modals in that folder must be migrated to HeroUI v3.**
The existing `/src/components/ui/modal.tsx` remains for backward compatibility but must not be used in refactored code.

### Before Implementing

Always fetch the Modal docs first:

```bash
node scripts/get_component_docs.mjs Modal
```

Or directly: `https://heroui.com/docs/react/components/modal.mdx`

### Critical HeroUI v3 Rules

| Rule                    | Detail                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| No Provider             | `<HeroUIProvider>` does NOT exist in v3                             |
| Compound components     | Use dot-notation sub-components, not flat props                     |
| `onPress` not `onClick` | React Aria convention for accessibility                             |
| Import source           | `@heroui/react` only — not `@heroui/system` or `@heroui/theme` (v2) |
| Already installed       | `@heroui/react` and `@heroui/styles` are in `package.json`          |

### Modal Pattern

```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExampleModal({ isOpen, onOpenChange }: Props) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Title</ModalHeader>
            <ModalBody>{/* content */}</ModalBody>
            <ModalFooter>
              <Button variant="tertiary" onPress={onClose}>
                Batal
              </Button>
              <Button variant="primary" onPress={handleSubmit}>
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
```

### Semantic Button Variants in Modals

| Variant     | Use case                                 |
| ----------- | ---------------------------------------- |
| `primary`   | Main confirm/submit action (1 per modal) |
| `tertiary`  | Cancel/dismiss                           |
| `danger`    | Destructive actions (delete, reset)      |
| `secondary` | Alternative actions                      |

---

## Rule 6 — Unified Modal Pattern for Create / Edit

When a modal handles multiple operations (create, edit, view, duplicate), **create one modal shell** with mode-based view mapping. Do NOT create separate modal components per operation.

### Folder Structure

```
/src/templates/{domain}/{entity}-modal/
  index.tsx         ← modal shell: HeroUI Modal + VIEWS map + TITLES map
  types.ts          ← ModalMode type + shared props interface
  create-view.tsx   ← form/content for "create" mode
  edit-view.tsx     ← form/content for "edit" mode
  (view-view.tsx)   ← optional read-only view
```

### types.ts

```typescript
export type ModalMode = "create" | "edit";

export interface EntityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ModalMode;
  entityId?: string; // required when mode === "edit"
}

// Shared props passed into every view
export interface ViewProps {
  onClose: () => void;
  entityId?: string;
}
```

### index.tsx

```tsx
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { CreateView } from "./create-view";
import { EditView } from "./edit-view";
import type { EntityModalProps, ModalMode, ViewProps } from "./types";

const VIEWS: Record<ModalMode, React.ComponentType<ViewProps>> = {
  create: CreateView,
  edit: EditView,
};

const TITLES: Record<ModalMode, string> = {
  create: "Tambah",
  edit: "Edit",
};

export function EntityModal({
  isOpen,
  onOpenChange,
  mode,
  entityId,
}: EntityModalProps) {
  const View = VIEWS[mode];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{TITLES[mode]}</ModalHeader>
            <ModalBody>
              <View onClose={onClose} entityId={entityId} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
```

Reference implementations:

- `/src/templates/event/booking-link-modal/booking-link-modal.tsx`
- `/src/templates/event/create-event-modal/`

---

## Rule 7 — Data Fetching: Component → Hook → Service → API Route

**Never call `fetch()` or `axios` directly from a component.** The strict data flow is:

```
Component → Hook → Service function → /src/app/api (Next.js route handler)
```

### Axios Client

```typescript
// CORRECT — pre-configured interceptor client
import api from "@/services/api-client";

// WRONG — do not use
import apiClient from "@/utils/api-client"; // legacy, localStorage-based token
```

`/src/services/api-client.ts` provides:

- Base URL: `/api`
- `withCredentials: true`
- Bearer token via NextAuth session (request interceptor)
- Automatic response unwrapping + structured error objects (response interceptor)

### Service Function Pattern

```typescript
// /src/services/{domain}/{operation}.ts
import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type { EntityItem, CreateEntityPayload } from "./types";

export async function getEntities(): Promise<EntityItem[]> {
  const { data } = await api.get<ApiResponse<EntityItem[]>>("/entities");
  return data.data!;
}

export async function createEntity(
  payload: CreateEntityPayload,
): Promise<EntityItem> {
  const { data } = await api.post<ApiResponse<EntityItem>>(
    "/entities",
    payload,
  );
  return data.data!;
}
```

### Hook Placement Rule

Place hooks at the component that **owns** the data responsibility — the one that renders that data or triggers that mutation. If the data must be shared across siblings, use a Zustand store (→ Rule 2) instead of hoisting the hook.

---

## Rule 8 — React Query: Always Use & Register Keys in /src/constants/query-key.ts

Never use raw `useState` + `useEffect` for server data. All fetching and mutations use React Query.

### Centralized Query Keys

**All query keys must be defined in `/src/constants/query-key.ts`.**

> Migration rule: when refactoring a domain, move its `/src/hooks/{domain}/keys.ts` contents into `/src/constants/query-key.ts` and update all imports. Do not delete the old `keys.ts` until all references are updated.

```typescript
// /src/constants/query-key.ts

export const eventKeys = {
  all: ["events"] as const,
  detail: (id: string) => ["events", id] as const,
  payments: (eventId: string) => ["events", eventId, "payments"] as const,
  briefs: (eventId: string) => ["events", eventId, "briefs"] as const,
};

export const bookingKeys = {
  all: ["booking-links"] as const,
  detail: (token: string) => ["booking-links", token] as const,
};

export const financeKeys = {
  accounts: ["finance", "accounts"] as const,
  transactions: (params?: TransactionQueryParams) =>
    ["finance", "transactions", params] as const,
  report: (params?: ReportQueryParams) =>
    ["finance", "report", params] as const,
};

export const userKeys = {
  profile: ["user", "profile"] as const,
  businessProfile: ["user", "business-profile"] as const,
};

export const eventCategoryKeys = {
  all: ["event-categories"] as const,
};

// Add new domains here — one export object per domain
```

### Hook Patterns

```typescript
// /src/hooks/{domain}/use-entities.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEntities, createEntity } from "@/services/{domain}";
import { entityKeys } from "@/constants/query-key";

export function useEntities() {
  return useQuery({
    queryKey: entityKeys.all,
    queryFn: getEntities,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEntityPayload) => createEntity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all });
    },
  });
}
```

### Hook Checklist

Before finalizing any hook:

- [ ] `queryKey` imported from `/src/constants/query-key.ts`
- [ ] `queryFn` calls a function from `/src/services/{domain}/`
- [ ] Service function calls `/src/app/api` via `api` from `/src/services/api-client.ts`
- [ ] No direct `fetch()` or raw `axios` in the hook

---

## Rule 9 — Detect and Quarantine Unused Files

When refactoring a template folder, scan for files that are no longer referenced.

### Decision Tree

```
For each .tsx / .ts file in the folder:
  │
  ├─ Is it imported/used in 2+ different templates, pages, or components?
  │   YES → promote to /src/components/{category}/  (global component)
  │
  ├─ Is it imported/used only by the current parent?
  │   YES → keep in place (co-located is correct per Rule 3)
  │
  └─ Zero references found anywhere in /src?
      YES → move to {parent-folder}/_unused/
```

### How to Verify Before Moving

1. **Search by component name** — use workspace-wide search for the exported function/class name in all `.tsx`, `.ts` files under `/src`.
2. **Check barrel exports** — search for the filename in any `index.ts` re-exports.
3. **Only move to `_unused/` if zero references found outside the current folder.**

### `_unused/` Folder Convention

```
/src/templates/event/_unused/
  old-event-header.tsx
  legacy-payment-row.tsx
```

- Staging area — not immediately deleted.
- Do NOT re-export `_unused/` files from any `index.ts`.
- Review and permanently delete after confirming safety (check git blame / PRs).
- If a file in `_unused/` is later found to be needed, promote it back (and to global if needed).

### When to Promote to `/src/components/`

| Condition                                               | Action                                             |
| ------------------------------------------------------- | -------------------------------------------------- |
| Used by 2+ templates/pages                              | Move to `/src/components/{category}/`              |
| Generic UI pattern, not domain-specific                 | Move to `/src/components/ui/` or relevant category |
| Has no dependency on a specific domain's store or hooks | Safe to make global                                |

---

## Rule 10 — Barrel Exports (index.ts) Are Mandatory

Every module folder must expose its public API through an `index.ts`. This keeps imports clean and uniform across the codebase.

### Templates

Every template file must have a sibling `index.ts` that re-exports it:

```
/src/templates/event/
  event-template.tsx
  index.ts              ← export * from "./event-template"
```

```typescript
// /src/templates/event/index.ts
export * from "./event-template";
```

For template folders with multiple files (sub-components, modals), only export the top-level template from `index.ts`. Internal sub-components are not exported from the folder's `index.ts`.

### Hooks

Every domain hook folder must have an `index.ts` that re-exports all hooks:

```
/src/hooks/event/
  index.ts              ← re-exports all hooks in this folder
  use-events.ts
  use-event-detail.ts
  use-create-event.ts
  use-delete-event.ts
```

```typescript
// /src/hooks/event/index.ts
export * from "./use-events";
export * from "./use-event-detail";
export * from "./use-create-event";
export * from "./use-delete-event";
```

### Services

Every service domain must be a folder with individual operation files and an `index.ts`:

```
/src/services/event/
  index.ts              ← re-exports all service functions
  get-events.ts
  get-event.ts
  create-event.ts
  update-event.ts
  delete-event.ts
  types.ts
```

```typescript
// /src/services/event/index.ts
export * from "./get-events";
export * from "./get-event";
export * from "./create-event";
export * from "./update-event";
export * from "./delete-event";
export type * from "./types";
```

Do NOT put multiple service operations in a single `api.ts` file — each operation gets its own file.

### Components

Every component folder must have an `index.ts`:

```
/src/components/ui/
  index.ts              ← re-exports all UI components
  button.tsx
  badge.tsx
  spinner.tsx
```

```typescript
// /src/components/ui/index.ts
export * from "./button";
export * from "./badge";
export * from "./spinner";
```

---

## Rule 11 — Always Use `const` Function Declarations

**Never use `export default function` or `function` keyword for component or utility declarations.**
Always declare with `const` and use named exports.

```typescript
// WRONG
export default function EventTemplate() { ... }
function formatDate(date: Date) { ... }

// CORRECT
export const EventTemplate = () => { ... };
export const formatDate = (date: Date) => { ... };
```

This applies to:

- React components (templates, child components, modal views)
- Utility and helper functions
- Service functions
- Hook functions

**Exception:** Next.js requires `export default` for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and API route handlers (`route.ts`). Use `export default` only in those Next.js-mandated files.

```typescript
// page.tsx — Next.js requires default export here
export default function EventPage() {
  return <EventTemplate />;
}

// event-template.tsx — named const export
export const EventTemplate = () => {
  return <div>...</div>;
};
```

---

## Rule 12 — One Component Per File

Each `.tsx` file must contain **exactly one exported component**.

```typescript
// WRONG — two exported components in one file
export const EventCard = () => { ... };
export const EventCardSkeleton = () => { ... };

// CORRECT — split into separate files
// event-card.tsx
export const EventCard = () => { ... };

// event-card-skeleton.tsx
export const EventCardSkeleton = () => { ... };
```

### Exception — Small Support Components

A file may contain additional **unexported, logic-free** helper components defined in the same file, when they exist solely to structure the JSX of the main component and have no independent reuse value:

```typescript
// event-template.tsx
// Main export — one per file rule ✓
export const EventTemplate = () => {
  return (
    <div>
      <SectionHeader title="Events" />   {/* support component below */}
      <EmptyState />                      {/* support component below */}
    </div>
  );
};

// Support components — NOT exported, no logic, only JSX structure
const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-lg font-semibold">{title}</h2>
);

const EmptyState = () => (
  <p className="text-muted">Belum ada data.</p>
);
```

If a support component grows to include `useState`, `useEffect`, hooks, or any logic — extract it to its own file immediately.

---

## Refactoring Checklist

Before marking a template/component as done:

- [ ] File ≤ 300 lines
- [ ] Each child component has one clear responsibility
- [ ] Shared state across children uses a Zustand store in `/src/stores/`
- [ ] Parent-only children are co-located; shared components are in `/src/components/`
- [ ] Expensive computations wrapped in `useMemo`; stable callbacks in `useCallback`
- [ ] All modals in the folder use HeroUI v3 (`onPress`, compound API, no Provider)
- [ ] Fetched Modal docs before implementing (`node scripts/get_component_docs.mjs Modal`)
- [ ] Create/Edit modals use unified mode pattern with `VIEWS` + `TITLES` map
- [ ] No direct `fetch()` or `axios` in any component
- [ ] All service functions use `/src/services/api-client.ts` (not `/src/utils/api-client.ts`)
- [ ] All hooks call service functions from `/src/services/{domain}/`
- [ ] All query keys imported from `/src/constants/query-key.ts`
- [ ] Hooks placed at the component that owns the data responsibility
- [ ] Unused files searched workspace-wide before moving to `_unused/`
- [ ] Files used by 2+ pages/templates promoted to `/src/components/`
- [ ] Every template folder has an `index.ts` re-exporting the template
- [ ] Every hook domain folder has an `index.ts` re-exporting all hooks
- [ ] Every service domain is a folder with per-operation files and an `index.ts`
- [ ] Every component folder has an `index.ts`
- [ ] All functions/components use `const` declarations with named exports
- [ ] No `export default` except in Next.js-mandated files (`page.tsx`, `layout.tsx`, `route.ts`)
- [ ] Each `.tsx` file contains only one exported component
- [ ] Unexported support components in the same file have zero logic (pure JSX only)
