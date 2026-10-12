# Claude Code Journal

This journal tracks substantive work on documents, diagrams, and documentation content.

---

1. **Task - Project creation** (v0.1.0): Created `jupyterlab_advanced_code_viewer_extension` as new JupyterLab extension<br>
   **Result**: Scaffolded by `new-jupyterlab-extension.sh --headless` from copier template `jupyterlab/extension-template` v4.6.5, `kind: frontend-and-server`, settings and tests enabled. Purpose per `docs/brief.md`: bring follow-the-file, change display, marks, comments and notes panel of siblings `jupyterlab_advanced_markdown_viewer_extension` and `jupyterlab_advanced_html_viewer_extension` to notebooks and source files, inside the editor while the user types, no viewer mode. Repository initialised with `git init -b main` and initial import commit. Added `.claude/CLAUDE.md` overlay importing user and workspace layers without copying them: Makefile-only lifecycle, lockfile trio rule, Makefile version check (1.45, identical to canonical), pm-tools-only trackers, CLI agent-skill rule, graphify scope control, Required Skills table. Added `.claude/settings.json` with `worktree.bgIsolation: none`, as HTML viewer sibling. README rewritten: seven template badges, features and limitations from the brief, sections below Uninstall dropped. Tests on three tiers: pytest (hello route, 403 without token), Jest `request.spec.ts` (`requestAPI` against mocked `ServerConnection`), Galata (activation, settings load, hello route) with port from `JUPYTER_TEST_PORT` and own settings folder.
