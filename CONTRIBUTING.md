# Contributing

Thank you for considering a contribution. This project is intentionally minimal — every addition should earn its place.

## Before You Start

- **Check existing issues** — someone may already be working on it
- **Open a discussion first** — for significant changes, create an issue to align on direction
- **Keep it minimal** — prefer small, focused changes over sweeping refactors

## How to Contribute

1. **Fork** the repository
2. **Create a branch**: `git checkout -b fix/description` or `feature/description`
3. **Make your changes** with clear, atomic commits
4. **Test locally**: `npm run build` must pass without errors
5. **Open a pull request** using the provided template

## Code Standards

| Aspect | Guideline |
|--------|-----------|
| **Framework** | Astro-native components. No React. |
| **Styling** | Tailwind CSS only. No custom CSS unless necessary. |
| **TypeScript** | All new code must be typed. No `any` without comment. |
| **Formatting** | Prettier handles formatting. Run `npx prettier --write .` before commit. |
| **Bundle size** | Avoid heavy dependencies. Prefer native browser APIs. |

## Commit Messages

Use clear, descriptive commit messages:

```
fix: handle missing Supabase env vars gracefully
feat: add keyboard navigation to thought stream
docs: clarify environment setup in README
```

## What We Won't Merge

- New social features (likes, reactions, comments, view counts)
- Heavy animation libraries
- React/Vue/Angular components
- Dashboard/CMS abstractions
- Skill bars, particle backgrounds, or startup-template aesthetics

## Questions?

Open an issue with the `question` label. We'll respond within a few days.

---

By contributing, you agree to license your work under the same MIT license as this project.
