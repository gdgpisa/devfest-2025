# Website DevFest Pisa 2026

[![Netlify Status](https://api.netlify.com/api/v1/badges/996efb3d-5136-4b7f-af08-2fd99ddc40ef/deploy-status)](https://app.netlify.com/sites/gdgpisa-devfest-2025/deploys)

The official website for **DevFest Pisa 2026** — a community-driven technology event organized by [GDG Pisa](https://gdg.community.dev/gdg-pisa/) (Google Developer Groups). Scheduled for **April 18, 2026** at MACC (Meeting Art Craft Center) in Pisa, Italy.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Technology Stack

- **Framework**: [Astro 5](https://astro.build) - Static site generation with Islands Architecture

- **UI Components**: [Preact 10](https://preactjs.com) via `@astrojs/preact` integration for interactive sections

- **Language**: [TypeScript](https://www.typescriptlang.org) with strict type checking

- **Styling**: Cascading CSS with CSS layers and custom design system

- **Icons**: `astro-icon` with Material Symbols and Material Design Icons

- **(Preferred) Package Manager**: [Bun](https://bun.sh) or [npm](https://www.npmjs.com)

- **Deployment**: [Netlify](https://netlify.com) with continuous deployment

## Project Structure

```
src/
├── assets/                   # Content & data files
│   ├── data-*/               # Structured data (sponsors, supporters, partners)
│   ├── gallery/              # Event photography with responsive grid naming
│   ├── news/                 # Blog posts and announcements
│   ├── speakers/             # Speaker data (Sessionize JSON exports + sessions)
│   ├── team/                 # Team member photos
│   ├── icons/                # SVG icon assets
│   └── fonts/                # Custom typography files
├── components/
│   ├── astro/                # Server-rendered components (Header, Footer, Gallery)
│   └── preact/               # Interactive components (Schedule filtering, icons)
├── layouts/
│   └── Base.astro            # Root layout with meta tags and global styles
├── lib/
│   ├── astro/                # Server utilities (Sessionize parsing, data transformations)
│   └── client/               # Browser utilities and helpers
├── pages/                     # File-based routing
└── styles/                    # Global styles and component CSS
```

### Data Management

**Speaker & Talk Data:**

- Source: Integrated with [Sessionize](https://sessionize.com) conference management platform

- Files: `src/assets/sessionize/sessions.json` and `speakers.json`

- Processing: `src/lib/astro/sessionize.ts` transforms raw exports into typed Speaker and Talk objects

- Features: Speaker deduplication, GDE (Google Developer Expert) badge detection, room/language/level categorization

**Static Content:**

- Simple Markdown-based can be created directly in `src/pages/` using the `MarkdownPage.astro` layout

- Blog posts and news announcements in `src/assets/news/`

- Team photos automatically discovered from `src/assets/team/` directory

- Sponsor/partner data in modular TypeScript files with image imports

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Access at http://localhost:4321

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Path Aliases

The project uses convenient path aliases configured in `tsconfig.json` and `astro.config.mjs`:

- `@/*` maps to `src/*` for cleaner imports

### Key Configuration Files

- `astro.config.mjs` - Astro framework configuration with integrations

- `tsconfig.json` - TypeScript configuration with strict mode

- `package.json` - Project dependencies and npm scripts

- `public/` - Static assets and service worker

- `src/env.d.ts` - TypeScript declarations for custom modules and assets

## Deployment

The site is automatically deployed to [Netlify](https://app.netlify.com/sites/gdgpisa-devfest-2025) whenever changes are pushed to the main branch.

**Deployment Configuration:**

- Build command: `npm run build`

- Publish directory: `./dist/`

- Custom headers in `public/_headers`

- Redirect rules in `public/_redirects`
