# Shared assets

Static assets reusable across the app — icons and images with **no business
meaning**. Domain-specific imagery belongs to the slice that owns it.

## SVGs as React components

SVGs are wired through `@svgr/webpack` in `next.config.ts`, so you can import
an icon as a component:

```tsx
import Logo from '@/shared/assets/icons/logo.svg';

<Logo className="size-6" />;
```

Add the `?url` suffix to import the raw file URL instead (e.g. for `<img src>`
or `background-image`):

```tsx
import logoUrl from '@/shared/assets/icons/logo.svg?url';
```

Type declarations for `*.svg` imports live in `@/shared/lib/svg.d.ts`.
Drop icons in `icons/` and raster images in `images/`.
