# Eagle Rocketry website

This repository contains the public website for Eagle Rocketry, the student rocketry organization and SEDS chapter at Cal State LA.

## 2026 redesign

The redesigned homepage is a framework-free static site in [`eagle-rocketry-static-site/`](eagle-rocketry-static-site/). It uses HTML, CSS, JavaScript, SVG brand assets, and a canvas-based launch effect. There is no package installation or build step.

### Preview locally

From the repository root, run a static file server against the site folder. For example:

```powershell
py -3 -m http.server 8765 --directory eagle-rocketry-static-site
```

Then open `http://127.0.0.1:8765/`.

Opening `index.html` directly also works for basic review, but a local server more closely matches GitHub Pages.

## Repository structure

- `.github/workflows/jekyll.yml` publishes the static site to GitHub Pages after changes reach `main`.
- `eagle-rocketry-static-site/index.html` contains the page structure and public content.
- `eagle-rocketry-static-site/styles.css` contains responsive layout, art direction, and animation styles.
- `eagle-rocketry-static-site/launch.js` controls the readiness counter, launch sequence, smoke simulation, and interactive motion.
- `eagle-rocketry-static-site/assets/` contains approved public brand and diagram assets used by the published site.
- `assets/` contains engineering source files and diagrams contributed by team members.

## Content maintenance

- The Spring 2026 bill of materials remains on the team SharePoint and is not stored in public Git history.
- The workbook is intentionally identified as in progress because coefficient fitting and the component list are incomplete.
- Flight Operations links to the team-contributed liquid launch logic diagram.
- Historical project summaries link to the corresponding Cal State LA capstone archive pages.

Review technical files, personal metadata, image rights, and team approval before adding new downloadable assets to the public repository.

## Deployment

The Pages workflow uploads `eagle-rocketry-static-site/` directly. Changes pushed to a feature branch do not update the live site. Merge an approved pull request into `main` to deploy.

## Contributing

1. Create or update a focused branch.
2. Preview the site on desktop and mobile widths.
3. Verify that external links, reduced-motion behavior, and the launch skip control work.
4. Use clear commit subjects and explanatory commit bodies.
5. Open a pull request into `main` and address review feedback before merging.
