# jupyterlab_advanced_code_viewer_extension

[![GitHub Actions](https://github.com/stellarshenson/jupyterlab_advanced_code_viewer_extension/actions/workflows/build.yml/badge.svg)](https://github.com/stellarshenson/jupyterlab_advanced_code_viewer_extension/actions/workflows/build.yml)
[![npm version](https://img.shields.io/npm/v/jupyterlab_advanced_code_viewer_extension.svg)](https://www.npmjs.com/package/jupyterlab_advanced_code_viewer_extension)
[![PyPI version](https://img.shields.io/pypi/v/jupyterlab-advanced-code-viewer-extension.svg)](https://pypi.org/project/jupyterlab-advanced-code-viewer-extension/)
[![Total PyPI downloads](https://static.pepy.tech/badge/jupyterlab-advanced-code-viewer-extension)](https://pepy.tech/project/jupyterlab-advanced-code-viewer-extension)
[![JupyterLab 4](https://img.shields.io/badge/JupyterLab-4-orange.svg)](https://jupyterlab.readthedocs.io/en/stable/)
[![Brought To You By KOLOMOLO](https://img.shields.io/badge/Brought%20To%20You%20By-KOLOMOLO-00ffff?style=flat)](https://kolomolo.com)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=flat)](https://www.paypal.com/donate/?hosted_button_id=B4KPBJDLLXTSA)

Follow a notebook or a source file while an AI agent writes it. The open document shows each change as it lands on disk, your unsaved edits stay where they are, and you keep typing the whole time. Mark passages and write comment threads on the code; the notes are stored in the file, so the agent reads and answers them there.

This extension brings the functions of [jupyterlab_advanced_markdown_viewer_extension](https://github.com/stellarshenson/jupyterlab_advanced_markdown_viewer_extension) and [jupyterlab_advanced_html_viewer_extension](https://github.com/stellarshenson/jupyterlab_advanced_html_viewer_extension) to notebooks (`.ipynb`) and to every text file the JupyterLab file editor opens, such as `.py`, `.ts`, `.rs`, `.sh` and `.yaml`. The two viewers show a read-only page; this extension works inside the notebook and inside the file editor while you edit. It adds no viewer widget and no mode to enter.

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

## Limitations

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
