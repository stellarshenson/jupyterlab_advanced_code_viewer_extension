# jupyterlab_advanced_code_viewer_extension - Intent

This file states what the user wants from this extension and which decisions are taken. Where another document of this project differs from it, this file is correct. `docs/brief.md` holds the detail: the facts checked, the required behaviour, the tests and the records of the sibling extensions.

## 1. Purpose

This section states what the extension is for. The user works in JupyterLab while an AI agent in the lab terminal writes the same notebooks and source files on disk. The extension shows the agent's changes in the open document as they are written, and the user directs the agent with comments stored in the file.

- **Documents** - notebooks (`.ipynb`) and every text file the JupyterLab file editor opens
- **Following** - the open document shows a change that another program wrote to the file, without a reload, and keeps the user's unsaved edits
- **Marks and comments** - the user and the agent mark passages and write comment threads, stored in the file, where the agent reads and answers them
- **First case** - the agent executes a notebook with `jupyter nbconvert --to notebook --execute --inplace`, the user's rule for experiments, and the open notebook shows the new cells and outputs
- **Rank** - the user calls this extension "the grand opus" of the advanced viewer family

## 2. Main requirement

This section states the requirement the user ranks first. The extension works while the user edits. The user named this the major difference from the two sibling viewers, which show a read-only page.

- **Place** - inside the notebook and the file editor, with no separate viewer widget
- **No mode** - no viewer mode and no review mode; the user considered a mode that is entered on purpose and said "that feels weird"
- **Always active** - in a notebook's command mode and edit mode, in a rendered and in an unrendered Markdown cell, and in the file editor while the user types

## 3. Sibling extensions

This section names the two extensions whose functions this one brings to code. Both are folders beside this project, and both are installed in this lab, so their behaviour can be observed in the running JupyterLab.

| Sibling | Description | Reuse |
|---|---|---|
| `../jupyterlab_advanced_markdown_viewer_extension` | Follows a Markdown file in the Markdown Preview, shows each change, and keeps marks and comments in the file as HTML comments | Following, change display, the rule for unsaved edits, tab icons, mark grammar, notes panel, agent skill, setting names |
| `../jupyterlab_advanced_html_viewer_extension` | Shows an HTML file with trust and refresh, and adds the same marks and notes panel | The rule that only text written in the file takes a comment, and the second adaptation of the notes code |

- **One grammar** - the marks use the Markdown viewer's grammar, so an agent that knows one of the three extensions can work in all of them
- **Records** - each sibling holds acceptance criteria, a defects register, a journal and functional tests for the same functions; read them before design
- **Code** - the notes code is copied into this project, and the siblings are not changed
- **Dependencies** - undecided whether this extension installs the two viewers with it; ask the user before adding a sibling as a dependency

## 4. Decisions

This section lists the decisions and the origin of each. `User` means the user stated it. `Plan` means it was part of the plan the user answered "yes" to on 2026-10-12. `Proposed` means the planning session wrote it into the brief and the user has not answered.

| Decision | Origin |
|---|---|
| The name `jupyterlab_advanced_code_viewer_extension` | Plan |
| The extension works in edit mode and has no viewer mode or review mode | User |
| Text written in the file takes a comment; content that a script or a widget draws takes none | User, stated for the HTML viewer; applied to notebook outputs in the plan |
| A mark in code is stored in the file as comment lines of the file's language | Plan |
| A mark in a Markdown cell is stored as the Markdown viewer's HTML comments | Plan |
| A stored notebook output takes a comment, kept in the cell's metadata and flagged when the cell has run again | Plan |
| A file kind without a comment syntax, such as JSON or CSV, takes no mark | Plan |
| The notes code is a third copy now; a shared package for the three extensions comes later | Plan |
| A change from disk never moves the cursor, takes the focus or enters the user's undo history | Proposed |
| The change display is drawn over text that is already applied and never types into the document | Proposed |
| A mark shows as painted text plus one compact marker; a setting shows the raw comment lines | Proposed |
| Settings switch single functions on and off, as in the Markdown viewer | Proposed |

## 5. Release outcomes

This section states what the user can do when each release is complete. The order is part of the plan the user approved: following comes before marks, because a mark must stay on its text while the file changes.

| Release | Outcome |
|---|---|
| 1 | The user types in a source file while an agent writes the same file, and each change appears with the cursor in place and without JupyterLab's File Changed dialog |
| 2 | The user keeps a notebook open while an agent edits or executes it on disk, and cells and outputs change in place |
| 3 | The user marks a passage of a source file and writes a comment, the agent answers in the same thread, and the marker does not change what the program does |
| 4 | The user does the same in a notebook: Markdown cells, code cells and stored outputs |

- **Per release** - acceptance criteria, functional tests that write the file on disk while the test types, a README, and the agent skill where it applies
