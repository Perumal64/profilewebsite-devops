# Perumal S: Profile Website

Single-page profile site built with **HTML5, CSS3 and vanilla JavaScript only**, with a full CI/CD pipeline on GitHub Actions.

- **Live site:** https://sivaperumal64.github.io/REPO-NAME/ (replace `REPO-NAME` with this repository's name)
- **Sections:** hero, professional journey, skills, personal likings, family, hobbies, footer/contact
- **Features:** light and dark theme (remembers your choice), responsive navigation, scroll reveal, "show more" timeline, flip cards, hobby lightbox, active-section highlighting, keyboard and screen-reader friendly

## Project structure

| Path | Purpose |
|---|---|
| `index.html` | All sections and content |
| `css/theme.css` | **The only file with colours, fonts and sizes** (light and dark) |
| `css/style.css` | Layout and components, using `var()` for every value |
| `js/main.js` | Theme toggle, navigation, scroll reveal, flip cards, lightbox |
| `images/` | One folder per section |
| `scripts/check-site.mjs` | Dependency-free project checks used by CI |
| `.github/workflows/` | The five GitHub Actions workflows |
| `lighthouserc.json` | Lighthouse score thresholds |

## Change the theme

Edit only `css/theme.css` (the `:root` block is light, `[data-theme="dark"]` is dark). No edits to `index.html` or `style.css` are needed. CI fails if a colour is hardcoded anywhere else.

## Run locally

Open `index.html` in a browser, then run the same checks CI runs:

```bash
npm test          # site checks + JS syntax + HTML lint + CSS lint
```

## Git workflow

- `main`: always deployable. Every push to `main` publishes the site.
- `develop`: integration branch. Work is merged here first.
- Short-lived branches, named in lowercase: `feature/*`, `theme/*`, `ci/*`, `fix/*`, `docs/*`, `chore/*`.
- Open a pull request into `develop`; when `develop` is stable, open a release pull request `develop` into `main`.
- Commit messages and PR titles use `type: summary`, for example `feat: add skills section`.

## CI/CD pipeline

| Workflow (exact name) | File | Runs when | What it does |
|---|---|---|---|
| Validate Website | `validate.yml` | push or PR to `main`/`develop` | htmlhint, stylelint, JS syntax check, theme/link/pipeline checks |
| Pull Request Checks | `pr-checks.yml` | PR opened or updated | branch-name rule, PR-title rule, 2 MB file-size guard, changed-files summary |
| Deploy to GitHub Pages | `deploy.yml` | push to `main` | re-runs site checks, packages only site files, publishes to Pages |
| Lighthouse Audit | `lighthouse.yml` | after a successful deploy | audits the live URL against `lighthouserc.json` |
| Workflow Notifications | `notify.yml` | after any of the four above | run summary; opens an issue if a run on `main`/`develop` fails |

Dependabot (`.github/dependabot.yml`) keeps the action versions up to date.

## One-time repository setup

1. **Settings > Pages > Build and deployment > Source:** GitHub Actions.
2. **Settings > Branches:** protect `main` (and `develop`) and require the four "Validate Website" jobs to pass before merging.
3. Replace the LinkedIn link in the footer with your profile URL.
