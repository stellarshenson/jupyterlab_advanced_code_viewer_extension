<!-- @import /home/lab/.claude/CLAUDE.md -->
<!-- @import /home/lab/workspace/.claude/CLAUDE.md -->

# Project-Specific Configuration

This file is an overlay. It imports two layers and copies neither:

- **User layer** - `/home/lab/.claude/CLAUDE.md`, applies to every project on this machine
- **Workspace layer** - `/home/lab/workspace/.claude/CLAUDE.md`, applies to everything under `~/workspace`

Both layers apply in full. Rules below extend or strengthen them; where they overlap, the stricter
wording wins. The workspace `/home/lab/workspace/.claude/` directory and the skills the two layers
name carry every standard not restated here.

## Mandatory Bans (Reinforced)

The following workspace rules are STRICTLY ENFORCED for this project:

- **No automatic git tags** - only create tags when user explicitly requests
- **No automatic version changes** - only modify version in package.json/pyproject.toml/etc. when user explicitly requests
- **No automatic publishing** - never run `make publish`, `npm publish`, `twine upload`, or similar without explicit user request
- **No manual package installs if Makefile exists** - use `make install` or equivalent Makefile targets, not direct `pip install`/`uv install`/`npm install`
- **No automatic git commits or pushes** - only when user explicitly requests

## Project Context

JupyterLab 4 extension, `kind: frontend-and-server`, scaffolded from the official copier template
`jupyterlab/extension-template` v4.6.5. The brief is `docs/brief.md`; read it in full before any
design or code work, its section "Sibling records to read" included.

The extension brings the functions of the two read-only viewers, `jupyterlab_advanced_markdown_viewer_extension`
and `jupyterlab_advanced_html_viewer_extension`, to notebooks and to every text file the file editor
opens. The open document follows the file while an AI agent or another program writes it and shows
each change; the user's unsaved edits are kept; the user and the agent mark passages and write
comment threads that are stored in the file.

**The rule that shapes this project**: it works while the user edits. It adds no viewer widget, no
viewer mode and no review mode. Every function is active in a notebook's command mode and edit mode,
in a rendered and an unrendered Markdown cell, and in the file editor while the user types. Functions
are switched on and off by settings, under the Markdown viewer's setting names.

**Read first**, as the brief orders: the two siblings beside this project,
`../jupyterlab_advanced_markdown_viewer_extension` and `../jupyterlab_advanced_html_viewer_extension`
- their README, `docs/`, `.claude/CLAUDE.md`, `.claude/JOURNAL.md`, `src/`, `ui-tests/tests/` and
the agent skill under `.agents/skills/`. Their trackers are read through `pm-tools` only. A rejected
criterion or defect there records a decision already refused; do not propose it again without a new
reason. No sibling extension becomes an install dependency without the Star Colonel's word.

**Architecture at creation** (the scaffold; the brief's releases replace it):

- **Frontend** (TypeScript, `src/`) - `index.ts` the plugin with the settings load, `request.ts` the
  call to the server namespace `jupyterlab-advanced-code-viewer-extension`
- **Server** (Python, `jupyterlab_advanced_code_viewer_extension/`) - `routes.py` the `hello` route,
  every handler under `@tornado.web.authenticated`; `.github/scripts/check_auth.py` is the gate
- **Schema** (`schema/plugin.json`) - the settings; the names follow the Markdown viewer where the
  function is the same
- **Notes code** - copied from the two viewers into this project and kept in modules separate from
  the editor and notebook code, so a shared package can be taken out later; the two viewers are not
  changed from here
- **Tests** - pytest in `jupyterlab_advanced_code_viewer_extension/tests/`, Jest in `src/__tests__/`,
  Playwright/Galata in `ui-tests/`
- **CI/CD** - GitHub Actions plus jupyter-releaser under `.github/workflows/`

**Feature specification** - criteria in `docs/acc-crit*.md`, defects in `docs/defects*.md`, both
written and read only through `pm-tools`.

## Build Lifecycle - Makefile Only

The Makefile owns the whole build lifecycle. Never run `pip`, `jlpm`, `yarn`, `npm`,
`python -m build`, `twine`, or any build, publish or clean command directly - those bypass the
project-local `.nodeenv/` toolchain the Makefile pins.

| Target          | Effect                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| `make install`  | build and install the extension (raises the patch version, by design of Makefile 1.42+) |
| `make publish`  | release to npm and PyPI - needs explicit approval every time                            |
| `make clean`    | remove build artefacts                                                                  |
| `make mrproper` | remove all build and virtual-environment artefacts                                      |
| `make build`    | re-resolve `yarn.lock`, format, build the wheel and the sdist into `dist/`              |
| `make test`     | Jest, pytest and the endpoint authentication gate                                       |

**Makefile version check**: the local Makefile declares its version on line 1. Compare it against
`/home/lab/workspace/private/jupyterlab/@utils/jupyterlab-extensions/Makefile` and copy the canonical
file over the local one as soon as a newer version is found. Check at the start of any build work.
Local version at project creation: 1.45, identical to canonical.

**The Galata suite has no Makefile target**, so it is the one lifecycle step outside the Makefile:
`jlpm install` and `jlpm playwright install chromium` in `ui-tests/`, then
`JUPYTER_TEST_PORT=<free port> jlpm playwright test`. Port 8888 belongs to this workstation's own
lab. Redirect output to a file instead of `| tee`, which reports tee's exit status. The suite runs
against the extension that `make install` put into the lab.

## Dependency Ranges

The rule is the jupyterlab-extension skill's: floor at the installed and tested `major.minor`,
ceiling at the next major, in `pyproject.toml`, `package.json` and `ui-tests/package.json` alike.
Floors are read from the installed packages (`pip list`, `node_modules/<pkg>/package.json`), never
from PyPI or the npm registry. `typescript` keeps its tilde; `lib0` and `webpack` stay exact under
`resolutions`. A range edit is followed by `make build`, which re-resolves `yarn.lock`.

## Git Rules (Project-Specific)

- The repository was initialised with `git init -b main` and an initial import of every artefact
- **Always commit `package.json`, `package-lock.json` and `yarn.lock` together** - a lockfile left
  behind makes CI fail with YN0028 on an immutable install. Makefile 1.41+ produces no
  `package-lock.json`, so in practice this is `package.json` with `yarn.lock`, and
  `ui-tests/package.json` with `ui-tests/yarn.lock`

## Journal Rules (Project-Specific)

- **APPEND ONLY**: New journal entries MUST be appended at the end of the file, never inserted between existing entries
- Entries maintain strict chronological order by position - the last entry in the file is always the most recent work
- Never reorder, move, or insert entries out of sequence
- The Stellars **journal plugin** is the canonical tool for this file: create via `/journal:create`, append via `/journal:update`, archive via `/journal:archive`. The `journal:journal` skill auto-triggers on any mention of "journal" and runs `journal-tools check` after every write
- Direct edits to `JOURNAL.md` are a last resort - prefer the plugin so modus secundis format, continuous numbering and append-only order are enforced automatically

## Acceptance Criteria and Defects

- Criteria live in `docs/acc-crit*.md` and defects in `docs/defects*.md`, written **only** through
  the project-management plugin (the `pm-tools` CLI), never by a hand edit of either file:
  `/project-management:acc-crit` adds, closes, rejects or relates a criterion,
  `/project-management:defect` files, triages, logs or closes a defect, `/project-management:report`
  gives status and coverage
- **Every feature gets its acceptance criteria before the code**, and every criterion names the test
  that proves it
- **Functional tests under `ui-tests/` are part of every feature**, not an afterthought, and run
  green before a release
- Each release of the brief is complete by itself: criteria, tests, README, agent skill where it
  applies
- Close a criterion only on evidence - the test that ran and what it showed

## Tests

All three tiers of the jupyterlab-extension skill's testing strategy, written to its
`references/galata-testing.md`:

- **pytest** under `jupyterlab_advanced_code_viewer_extension/tests/` for the server code
- **Jest** under `src/__tests__/` for frontend logic
- **Playwright/Galata** under `ui-tests/` for everything visible in the browser: the port through
  the one variable `JUPYTER_TEST_PORT`, the test server on its own settings folder, no snapshot-only
  assertions, and a suite that can fail - mutate what a test guards and watch it go red before
  trusting its green
- Galata tests act as the agent: they write the file on disk while the test types in the same
  document, then assert the text, the cursor, the undo history and the absence of the File Changed
  dialog

## Command-Line Tools and Their Agent Skill

A command-line tool the extension ships (an entry point under `[project.scripts]` in
`pyproject.toml`) gets the `--help` and the agent skill that the jupyterlab-extension skill's section
"Agent Skill for a Shipped CLI" prescribes.

- **Name** - the extension's name in kebab-case, `jupyterlab-advanced-code-viewer-extension`, for
  the directory and the `name:` field alike
- **Location** - `.agents/skills/jupyterlab-advanced-code-viewer-extension/SKILL.md` in the
  repository root, and in the wheel through one line in the `shared-data` table of `pyproject.toml`
- **Same commit** - the skill and the `--help` text change in the commit that changes the CLI
- **Never inside the Python package** - the CI link check imports the package for every link in a
  Markdown file inside it, and fails without `jupyter_server`
- **Reference implementation** -
  `/home/lab/workspace/private/jupyterlab/jupyterlab_notifications_extension`

## Scope Control - graphify

- Run `/graphify` once the first source is in place to build `tmp/graphify-out/`
- Run `graphify affected` before editing existing code to learn its callers and dependents; that
  affected set is the change budget, and an edit outside it needs the Star Colonel's word
- Run `graphify update` after every edit
- `tmp/` is gitignored, so the graph never ships

## Required Skills

| Skill                                   | Use                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `jupyterlab-extension`                  | extension development guidelines, testing strategy, CI/CD, caveats                    |
| `my-browser`                            | browser automation for screenshots and UI verification against the running JupyterLab |
| `project-management:project-management` | acceptance criteria and defects through the `pm-tools` CLI                            |
| `graphify`                              | the codebase graph and the impact analysis that bounds every change                   |
| `journal:journal`                       | the project journal through the `journal-tools` CLI                                   |

## Strengthened Rules

- **No mode** - no viewer mode, no review mode, no separate viewer widget; a function that needs a
  mode to be entered is a design error, not a setting
- **The user's document is sacred** - a change from disk never moves the cursor or the selection,
  never takes the focus, never enters the user's undo history, and never shows the File Changed
  dialog once applied; a save never overwrites a disk change the extension has not applied
- **A marker never changes what the program does** - a marker inside a string, a here-document or a
  template literal is refused or placed outside; a file kind without a comment syntax takes no mark
- **No kernel execution** - the extension starts none
- **Styling through JupyterLab CSS variables only** - no literal colours, so every theme renders the
  change display and the marks; verify on stock light and stock dark with `my-browser`
- **No screenshot claim without a render** - a statement about visible behaviour needs a real
  browser session behind it
