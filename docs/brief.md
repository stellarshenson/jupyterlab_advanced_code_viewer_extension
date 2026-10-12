# Brief - jupyterlab_advanced_code_viewer_extension

A copy of this brief is saved in the project as `docs/brief.md`.

## Purpose

The extension brings the functions of `jupyterlab_advanced_markdown_viewer_extension` and `jupyterlab_advanced_html_viewer_extension` to two more document kinds: notebooks (`.ipynb`) and source files (every text file the JupyterLab file editor opens, such as `.py`, `.ts`, `.rs`, `.sh`, `.yaml`).

- The open document follows the file while an AI agent or another program writes it, and shows each change
- The user's unsaved edits are kept
- The user and the agent mark passages and write comment threads; the notes are stored in the file, so the agent reads and answers them there

The user calls this extension the largest of the family.

## The major difference from the two viewers

The two viewers show a read-only page. **This extension works while the user edits.** This is the user's stated main requirement.

- It works inside the notebook and inside the file editor. It adds no separate viewer widget
- It has no viewer mode and no review mode. The user considered a mode that must be entered on purpose and rejected it
- Every function is active in a notebook's command mode and edit mode, in a rendered and in an unrendered Markdown cell, and in the file editor while the user types
- Functions are switched on and off by settings, as in the Markdown viewer, not by a mode

## Read first

- `../jupyterlab_advanced_markdown_viewer_extension` - README, `docs/acc-crit-advanced-markdown-viewer.md`, `docs/research-live-markdown-reconciliation.md`, the agent skill in `.agents/skills/` (the mark grammar), the Python package (`watch.py`, `routes.py`), and `src/` (`watcher.ts`, `channel.ts`, `diff.ts`, `place.ts`, `notes.ts`, `notes-panel.ts`, `marks.ts`, `swatch.ts`, `handle.ts`)
- `../jupyterlab_advanced_html_viewer_extension` - README, `docs/`, `src/` (how the notes code was adapted a second time; `origin.ts` holds the rule that only text written in the file takes a comment)
- The skills `jupyterlab-extension` and `source_investigation`

## Sibling records to read

Added on 2026-10-12 after the first version of this brief. The two viewers already built the same functions for read-only pages; their records hold the behaviour promised, the failures met and the decisions refused. Read them before you design, and start this project's acceptance criteria from the ones that apply here.

| Record | Markdown viewer | HTML viewer |
|---|---|---|
| Acceptance criteria | `docs/acc-crit-advanced-markdown-viewer.md` - 193 closed, 6 rejected | `docs/acc-crit-advanced-html-viewer.md` - 77 closed, 1 rejected |
| Defects | `docs/defects.md`, `docs/defects/` - 123 closed, 7 rejected, 3 regressions | `docs/defects-advanced-html-viewer.md` - 27 closed, 1 regression |
| Journal | `.claude/JOURNAL.md` | `.claude/JOURNAL.md` |
| Project rules | `.claude/CLAUDE.md` | `.claude/CLAUDE.md` |
| Functional tests | `ui-tests/tests/` - 11 spec files and `helpers.ts` | `ui-tests/tests/` - 5 spec files and `helpers.ts` |

- Read both trackers through `pm-tools` (`pm-tools report docs --summary`, then the categories), never by hand edit
- Categories of the Markdown viewer that map to this extension: `DETECT`, `EVENT`, `APPLY`, `HILITE`, `ANIM`, `CUE`, `CONFIG`, `COMPAT`, `NOTES`
- Categories of the HTML viewer that map to this extension: `LIVE`, `ORIGIN` (for notebook outputs), `STORE`, `MARK`, `PANEL`, `ROUTE`, `AGENT`
- A rejected criterion or defect records a decision already refused; do not propose it again without a new reason
- `ui-tests/tests/siblings.spec.ts` and the `COMPAT` criteria of the Markdown viewer show how it is tested beside the other family extensions
- The Markdown viewer declares ten family extensions as install dependencies in its `pyproject.toml`. This brief does not ask for that here; ask the user before you add a sibling as a dependency
- The sibling extensions named under Constraints are folders beside this project: `../jupyterlab_refresh_view_extension`, `../jupyterlab_colourful_tab_extension`

## Facts checked in this container on 2026-10-12

| Fact | How it was checked |
|---|---|
| JupyterLab 4.6.4, jupyter_server 2.21.1 | `pip list` |
| `jupyter-collaboration` is not installed, so the notebook's shared model lives in the browser only | `pip list` |
| `@jupyter/ydoc` 4.1.1 declares `insertCell`, `insertCells`, `deleteCell`, `moveCell` on the notebook and `updateSource(start, end, value)`, `setSource`, `setOutputs`, `updateOutputs`, `execution_count`, `setMetadata` on a cell | type declarations |
| `@jupyterlab/codemirror` declares `IEditorExtensionRegistry` | type declarations |
| `nbdime` 4.0.4 is installed; `diff_notebooks`, `merge_notebooks` and `patch_notebook` import | Python import |
| `watchdog` 6.0.0 is installed | `pip list` |
| JupyterLab saves a document by itself every 120 seconds (`autosave` true, `autosaveInterval` 120, same in the user's settings) | docmanager schema and user settings |
| 12 `@codemirror/lang-*` packages and 62 of 103 legacy modes declare a comment syntax (`commentTokens`); `lang-json` declares none | grep in `node_modules` |
| `jupyterlab-lsp` 5.3.0 and `jupyterlab_git` 0.55.0 are installed and draw in the same editors | `jupyter labextension list` |
| `jupytext` is not installed | `pip list` |

Nothing was prototyped. The source code of the two viewers was not read for this brief, only their READMEs and the Markdown agent skill.

## Statements from knowledge, not tested

Verify each one that your design depends on.

- `jupyter nbconvert --execute --inplace` keeps the cell ids of an nbformat 4.5 notebook
- CodeMirror moves a decoration's range with the text when the document changes
- A CodeMirror change dispatched with `Transaction.addToHistory.of(false)` is not undone by the user's undo
- A notebook's undo is the shared model's undo manager, which tracks changes by origin
- JupyterLab compares the file's modification time before a save and shows its File Changed dialog when the file is newer than the loaded model
- With `jupyter-collaboration` installed, the server replaces the document when the file changes on disk
- An agent's notebook reader may show cell sources and outputs and leave out cell metadata

## Required behaviour

### Working while the user edits

- One implementation paints changes and marks in the file editor and in every notebook cell editor
- A change from disk does not move the user's cursor or selection, does not take the focus, and keeps the text in view where it is
- A change from disk is not a step in the user's undo history: undo reverts the user's own edits only
- The change display (added text typed in on green, removed text struck through on red) is drawn over a change that is already applied. It never inserts or deletes characters one by one in the document, because the user types in the same document
- No File Changed dialog appears for a disk change that the extension has applied. A save, by the user or by the automatic save, never overwrites a disk change that the extension has not applied
- A mark stays on its text while the user types before it, after it or inside it. It survives undo, redo, cut and paste, and a cell being split, merged or moved
- A copy of marked text never creates a second mark with the same id
- Code stays readable with many marks: the user sees a mark as painted text plus one compact marker, not as raw marker lines. The cursor passes a marker as one unit, so typing cannot damage it. A setting shows the raw lines

### Following a source file

- A change another program writes to the file shows in the open editor within the Markdown viewer's times: file events through the server extension, a poll as fallback
- Unsaved edits are kept by the Markdown viewer's rule: a disk change is applied around them; where it overlaps them the user's text stays and the tab shows the red square
- Tab icons as in the Markdown viewer: changed, held back, deleted
- A file open in two editors, or in an editor and in the Markdown Preview, shows one consistent state

### Following a notebook

- Cells added, removed, moved and changed on disk show in the open notebook; outputs and execution counts are replaced. The notebook is changed in place, not reloaded: scroll position, selection, active cell, the cell being edited and the kernel session stay
- Cells are matched by cell id; a notebook without ids is matched by content
- Unsaved edits are kept per cell: an untouched cell takes the disk version; a cell with unsaved edits is merged by the source-file rule
- A cell that the lab's kernel is executing keeps its live output; a disk change to that cell's output is held back and the tab shows the red square
- A changed source is shown as in a source file. A replaced output and a new cell are shown with a coloured band, without typing
- Only changed cells travel from the server to the browser, so a notebook with large outputs stays responsive. `nbdime` is available on the server for comparison and three-way merge
- The README states that outputs written by `nbconvert` come from another kernel process, so the lab's kernel does not hold those variables
- Where `jupyter-collaboration` is installed, the extension detects it and leaves the replacing of the document to it; state the remaining functions in the README

### Marks, comments, notes panel

The mark grammar is the Markdown viewer's (`mark:<uuid>`, type, `colour=`, `status=closed`, comment lines `@handle <UTC stamp>: text`), so one agent skill grammar covers all three extensions.

| Content | Where a note is stored |
|---|---|
| Source file | Comment lines in the file's language, with the column range inside the marker when the mark covers part of a line |
| Markdown cell | HTML comments in the cell source, in the Markdown viewer's exact form; painted in the rendered cell and in the cell's editor |
| Code cell | Comment lines in the kernel's language, as in a source file |
| Stored output: stream text, `text/plain`, `text/html`, `text/markdown`, a picture as a whole | Cell metadata, with the quoted text and the execution count; flagged in the panel when the cell has run again |
| Output drawn by a script or a widget | Refused, by the HTML viewer's rule |
| Whole notebook | Notebook metadata |

- A marker never changes what the program does. A marker line inside a multi-line string, a here-document or a template literal would become data: place the marker outside it or refuse the mark
- A file kind without a comment syntax, such as JSON or CSV, takes no mark; the menu entry says why
- Six colours, comment and replies, edit, delete, recolour, close, show hidden, a note on the whole document, the author handle: as in the Markdown viewer's notes panel
- In a notebook the panel groups the notes by cell. A click on a row scrolls to the cell and reveals the passage
- A note is an edit of the document. It reaches the file at once when the document has no other unsaved edits, otherwise with the next save, which is the Markdown viewer's rule
- **Agent skill** in `.agents/skills/jupyterlab-advanced-code-viewer-extension`, installed and linked as the two viewers do it: the marker form per language, where markers may go in code, how to answer and close, and `scripts/watch-marks.py` for source files and notebooks. A bundled script lists every note of a notebook, the ones in cell and notebook metadata included, because an agent's notebook reader may leave metadata out

### Settings

The settings of the Markdown viewer under the same names where the function is the same (`enabled`, `pollInterval`, `highlight`, `highlightVisibility`, `fadeDuration`, `animation`, `animationSpeed`, `animationJitter`, `tabCue`, `notes`, `author`).

## Releases

Each release is complete by itself: acceptance criteria, tests, README, agent skill where it applies.

| Release | Content | Largest risk, test it first |
|---|---|---|
| 1 | Source files follow the disk while the user edits | A disk change in a live editor without the File Changed dialog, with cursor and undo intact |
| 2 | Notebooks follow the disk at cell level, outputs included | Cell matching, the automatic save meeting the agent's write, large outputs |
| 3 | Marks, comments, notes panel and agent skill for source files | Marker position in code, marks while typing |
| 4 | The same for notebooks: Markdown cells, code cells, outputs | Notes on outputs |

Following comes before marks because a mark must stay on its text while the file changes.

## Constraints

- No kernel execution is started by the extension
- It works beside `jupyterlab-lsp`, `jupyterlab_git`, `jupyterlab_refresh_view_extension`, `jupyterlab_colourful_tab_extension` and the two viewers. A `.md` or `.html` file open in the file editor is a source file here; its markers are the HTML comments the viewers write
- The notes code is copied from the two viewers into this project, as the HTML viewer did. Keep the copied modules separate from the editor and notebook code, so a shared package can be taken out later. Do not change the two viewers

## Tests

- Galata tests act as the agent: they write the file on disk while the test types in the same document, then assert the text, the cursor position, the undo history and the absence of the File Changed dialog
- A notebook test runs `jupyter nbconvert --to notebook --execute --inplace` on a notebook that is open in the lab
- A test for each language family writes a mark and then runs or parses the file, to prove the marker changed nothing: Python including a triple-quoted string, shell including a here-document, JavaScript including a template literal, YAML, and one file kind without comments

## Not in the first version

Record these in the README as limits:

- Accept or reject of a single change
- A separate read-only viewer for notebooks or source files
- Notes stored in a separate file beside the document
- A shared notes package for the three extensions
