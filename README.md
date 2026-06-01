# Personal Archive

A living personal site built with Astro — minimal, fast, and intentionally simple. Long-form essays and ongoing thoughts, served from Supabase with zero social mechanics.

**Live:** [portokus.vercel.app](https://portokus.vercel.app)

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | [Astro 5](https://astro.build) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Adapter | [Vercel](https://vercel.com) |
| Database | [Supabase](https://supabase.com) |
| Fonts | Open Sans via Fontsource |

---

## Structure

```
src/
├── components/          # UI pieces (Header, Footer, EssayListItem, etc.)
├── layouts/            # Layout.astro — global shell
├── pages/
│   ├── index.astro     # Home
│   ├── posts/          # Essays archive
│   ├── thoughts/       # Micro posts stream
│   ├── admin/          # Content management
│   └── api/            # API routes
├── lib/                # Supabase clients & utilities
├── types/              # TypeScript definitions
├── data/               # Site config
└── styles/             # Global CSS
```

---

## Content Model

| Type | Storage | Character |
|------|---------|-----------|
| **Essays** | Supabase (runtime fetch) | Long-form, shaped, versioned |
| **Thoughts** | Supabase | Short, ongoing fragments |
| **Static pages** | Repo (`.astro` files) | About, disclaimer, etc. |

Legacy Markdown essays remain in the repo for gradual migration.

---

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

### Environment

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Database connection |
| `SUPABASE_ANON_KEY` | Public Supabase key |
| `SITE_URL` | Canonical URL (optional, defaults to localhost) |

---

## Design Principles

- **No social mechanics** — no likes, reactions, comments, view counts, or followers
- **Mobile-first** — everything works beautifully on small screens
- **Zero React** — Astro-native components, no unnecessary JS
- **No CMS abstraction** — direct Supabase integration, no dashboard layers
- **Calm & focused** — minimal animations, no clutter, fast loading

---

## Deployment

Deployed to Vercel with server-side rendering for dynamic routes (`prerender = false`). Static pages are pre-rendered at build time.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. Key principles:

- Open an issue first for significant changes
- No React, no heavy dependencies, no social features
- `npm run build` must pass

---

## License

MIT — feel free to study or borrow patterns, but build your own voice.
