# jupyterlab_advanced_code_viewer_extension

[![GitHub Actions](https://github.com/stellarshenson/jupyterlab_advanced_code_viewer_extension/actions/workflows/build.yml/badge.svg)](https://github.com/stellarshenson/jupyterlab_advanced_code_viewer_extension/actions/workflows/build.yml)
[![npm version](https://img.shields.io/npm/v/jupyterlab_advanced_code_viewer_extension.svg)](https://www.npmjs.com/package/jupyterlab_advanced_code_viewer_extension)
[![PyPI version](https://img.shields.io/pypi/v/jupyterlab-advanced-code-viewer-extension.svg)](https://pypi.org/project/jupyterlab-advanced-code-viewer-extension/)
[![Total PyPI downloads](https://static.pepy.tech/badge/jupyterlab-advanced-code-viewer-extension)](https://pepy.tech/project/jupyterlab-advanced-code-viewer-extension)
[![JupyterLab 4](https://img.shields.io/badge/JupyterLab-4-orange.svg)](https://jupyterlab.readthedocs.io/en/stable/)
[![Brought To You By KOLOMOLO](https://img.shields.io/badge/Brought%20To%20You%20By-KOLOMOLO-00ffff?style=flat)](https://kolomolo.com)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=flat)](https://www.paypal.com/donate/?hosted_button_id=B4KPBJDLLXTSA)

You work in JupyterLab while an AI agent in the lab terminal writes the same notebooks and source files on disk. This extension shows the agent's changes in the open document as they are written, keeps your unsaved edits, and lets you direct the agent with comments stored in the file, where the agent reads and answers them.

It works while you edit. It runs inside the notebook and inside the file editor, adds no separate viewer and has no mode to enter: every function is active in a notebook's command mode and edit mode, in a rendered and in an unrendered Markdown cell, and in the file editor while you type. Settings switch single functions on and off.

It covers notebooks (`.ipynb`) and every text file the JupyterLab file editor opens, such as `.py`, `.ts`, `.rs`, `.sh` and `.yaml`. The first case it is built for: the agent executes a notebook with `jupyter nbconvert --to notebook --execute --inplace`, and the notebook you have open shows the new cells and outputs.

> [!NOTE]
> The extension is built in four releases, listed under [Releases](#releases). None is built yet; the features below describe the finished extension.

## Features

- **Changes show while you type** - a change another program writes to the file shows in the open editor within half a second; added text is painted green, removed text is struck through on red
- **Your edits are kept** - a change from disk lands around your unsaved edits; where it overlaps them your text stands and the tab shows a red square
- **Your place is kept** - a change from disk moves neither the cursor nor the selection, takes no focus, keeps the text in view where it is, and never appears in your undo history
- **No File Changed dialog** - a disk change the extension has applied raises no dialog, and a save never overwrites a disk change it has not applied
- **Notebooks change in place** - cells added, removed, moved and changed on disk show in the open notebook, outputs and execution counts included; scroll position, selection, active cell and the kernel session stay
- **Mark and comment on code** - six colours, comment threads, notes on a passage or on the whole document, listed in a panel beside the editor and grouped by cell in a notebook
- **Notes are stored in the file** - as comment lines in the file's language, as HTML comments in a Markdown cell, as cell metadata for a stored output; a marker never changes what the program does
- **Tab icons** - a half-filled circle for a new change, a red square for a change held back, a cross for a deleted file
- **Agent skill** - teaches an AI assistant the marker form per language, where markers may go in code, and how to answer and close a comment

## Sibling extensions

The extension brings the functions of two read-only viewers to code. Marks use the same grammar in all three, so an agent that knows one of them can work in each.

| Sibling                                                                                                                          | What it does                                                                                                                  | What this extension takes from it                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [jupyterlab_advanced_markdown_viewer_extension](https://github.com/stellarshenson/jupyterlab_advanced_markdown_viewer_extension) | Follows a Markdown file in the Markdown Preview, shows each change, and keeps marks and comments in the file as HTML comments | Following, change display, the rule for unsaved edits, tab icons, mark grammar, notes panel, agent skill, setting names |
| [jupyterlab_advanced_html_viewer_extension](https://github.com/stellarshenson/jupyterlab_advanced_html_viewer_extension)         | Shows an HTML file with trust and refresh, and adds the same marks and notes panel                                            | The rule that only text written in the file takes a comment                                                             |

## Releases

Following comes before marks, because a mark must stay on its text while the file changes.

| Release | What you can do when it is complete                                                                                                                  | Status    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1       | Type in a source file while an agent writes the same file; each change appears with the cursor in place and without JupyterLab's File Changed dialog | Not built |
| 2       | Keep a notebook open while an agent edits or executes it on disk; cells and outputs change in place                                                  | Not built |
| 3       | Mark a passage of a source file and write a comment; the agent answers in the same thread, and the marker does not change what the program does      | Not built |
| 4       | The same in a notebook: Markdown cells, code cells and stored outputs                                                                                | Not built |

## Limitations

- Outputs that `jupyter nbconvert --execute` writes come from another kernel process, so the kernel of the open notebook does not hold those variables
- Text that a script or a widget draws in an output takes no comment; only text stored in the file does
- A file kind without a comment syntax, such as JSON or CSV, takes no mark
- A single change cannot be accepted or rejected on its own
- There is no separate read-only viewer for notebooks or source files
- Notes are stored in the document, never in a separate file beside it
- Each of the three extensions carries its own copy of the notes code; there is no shared package

## Requirements

- JupyterLab 4.6 or later

## Install

To install the extension, execute:

```bash
pip install jupyterlab_advanced_code_viewer_extension
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_advanced_code_viewer_extension
```
