# Contributing

Thank you for considering a contribution. This project is intentionally minimal — every addition should earn its place.

## Before You Start

- Check existing issues before duplicating work
- Open an issue first for significant changes
- Keep changes small and focused

## How to Contribute

1. Fork the repository
2. Create a branch: `fix/description` or `feat/description`
3. Make your changes with clear commits
4. Run `npm run build` — it must pass
5. Open a pull request using the template

## Code Standards

| Aspect | Guideline |
|--------|-----------|
| Framework | Astro-native components. No React. |
| Styling | Tailwind CSS. Avoid custom CSS unless necessary. |
| TypeScript | Typed code. Avoid `any` without a comment. |
| Formatting | Prettier — run `npx prettier --write .` before commit. |
| Dependencies | Prefer native browser APIs over new packages. |

## Commit Messages

```
fix: correct search clear button on mobile
feat: add tag filter to blog index
docs: update Pages CMS setup in README
```

## What We Won't Merge

- Social features (likes, comments, view counts)
- Heavy animation libraries
- React/Vue/Angular components
- Extra CMS layers beyond Pages CMS
- Startup-template aesthetics (skill bars, particles, etc.)

## Questions?

Open an issue with the `question` label.

By contributing, you agree to license your work under the MIT license.
