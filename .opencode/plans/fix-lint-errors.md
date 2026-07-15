# Fix Lint Errors & Warnings

## 4 Errors: Must Fix

### 1. `ImportCostBreakdown.tsx:34,36` — Hooks after early return

Move `useRef` and `useEffect` before the `if (!items.length || !total) return null;` guard.

```
const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
useEffect(() => { ... }, [items]);

if (!items.length || !total) return null;
```

### 2. `useIsTouchDevice.ts:10` — setState in effect

Initialize `useState` with matchMedia value directly (server-safe):

```
const [isTouch, setIsTouch] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
  const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
  setIsTouch(mq.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

### 3. `usePrefersReducedMotion.ts:10` — setState in effect

Same pattern:

```
const [reduced, setReduced] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
  setReduced(mq.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

## 6 Warnings: Should Fix

### 4. `SpecComparisonGrid.tsx:3` — unused `useRef`, `useEffect`

Remove from import:
```
import { memo } from 'react';
```

### 5. `Dock.tsx:27` — unused `useAuthStore`

Change:
```
import { useAuthStore, useIsAuthenticated, useUser } from '@/store/authStore';
```
to:
```
import { useIsAuthenticated, useUser } from '@/store/authStore';
```

### 6. `UserMenuButton.tsx:7` — unused `useAuthStore`

Same as #5 — remove `useAuthStore` from import.

### 7. `Sidebar.tsx:6` — unused `useAuthStore`

Same as #5 — remove `useAuthStore` from import.

### 8. `users/[id]/page.tsx:23` — unused eslint-disable

Remove `// eslint-disable-line no-empty` and wrap catch body in a noop or comment:
```
} catch {
  /* empty */
}
```
