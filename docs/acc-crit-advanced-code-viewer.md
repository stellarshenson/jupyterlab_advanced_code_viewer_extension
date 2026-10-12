# Acceptance Criteria - jupyterlab_advanced_code_viewer_extension

An open notebook or source file follows the file while another program writes it, shows each change in the editor while the user types, and carries marks and comment threads stored in the file. The criteria are grouped by the four releases of `docs/brief.md`; each category description starts with its release.

A criterion that rests on a recorded decision ends with its origin: `user` - the user stated it; `plan` - part of the plan the user approved on 2026-10-12; `proposed in the brief, user has not answered`; `new, not in the brief` - added with this proposal on 2026-10-12. A criterion without an origin restates the brief's required behaviour or a closed criterion of a sibling viewer.

## Authors

- `@kj` Konrad Jelen

## Change detection `DETECT`

Release 1. Which open source files are followed and what counts as a change from disk

- [ ] `ACC-DETECT-1` **Open source files are followed** - CRITICAL; every text file open in the file editor is followed for a change on disk while its tab exists, and no longer once the tab is closed
  - test: Galata follow-file.spec: open a.py, write it on disk, assert the editor shows the new text; close the tab, assert the server holds no registration for the path
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-2` **Every file editor language is followed** - HIGH; a file of any kind the file editor opens is followed: .py, .ts, .rs, .sh, .yaml, .json, .md, .html and a file with no extension
  - test: Galata follow-file.spec: one fixture per kind, write each on disk, assert each editor shows the new text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-3` **A save from the lab is not a change from disk** - HIGH; a save made from the same JupyterLab session applies nothing, paints nothing and shows no tab icon
  - test: Galata follow-file.spec: type, press Ctrl S, assert no change decoration and no tab icon class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-4` **Identical content applies nothing** - MEDIUM; a touch, or a rewrite with the same bytes, applies no change, paints nothing and shows no tab icon
  - test: Galata follow-file.spec: touch the file and rewrite the same bytes, assert no decoration and no tab icon class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-5` **Edge: file deleted on disk** - MEDIUM; when the file is deleted on disk the editor keeps its text, the tab shows the deleted icon and no error dialog opens
  - test: Galata follow-file.spec: delete the open file on disk, assert the text stays, the tab carries the deleted class and no .jp-Dialog exists
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-6` **Edge: deleted file recreated** - MEDIUM; a deleted file recreated under the same name is followed again and its content is applied
  - test: Galata follow-file.spec: delete the file, recreate it with new text, assert the editor shows it and the deleted icon is gone
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:23:59Z @kj added
- [ ] `ACC-DETECT-7` **Edge: file renamed in JupyterLab** - MEDIUM; renaming the open file in the file browser moves following to the new path
  - test: Galata follow-file.spec: rename a.py to b.py in the file browser, write b.py on disk, assert the editor shows the new text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added

## File events and fallback poll `EVENT`

Release 1. The server extension reports a change by file events, with a poll as fallback, in the Markdown viewer's times

- [ ] `ACC-EVENT-8` **Server watches registered files by file events** - CRITICAL; the server extension watches the directory of each registered file through watchdog and reports a change without reading the file on a timer
  - test: pytest test_watch.py: register a path, write the file, assert one change event within 200 ms and no read of the file before the write
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-9` **A change shows within half a second** - CRITICAL; where file events arrive, a write by another program shows in the open editor within 500 ms
  - test: Galata follow-file.spec: write the file, sample the editor text every 50 ms, assert the new text within 500 ms
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-10` **One channel carries every document** - CRITICAL; the change events of every open document of one browser session travel over one WebSocket; opening more documents adds registrations, not connections or timers
  - test: Galata follow-file.spec: open ten files, count the WebSocket connections to the extension, assert one
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-11` **Fallback poll where no events arrive** - CRITICAL; on a mount that raises no file events, one batched stat request per pollInterval covers every open path, and a change it finds is applied
  - test: pytest test_watch.py: silence the watcher, write the file, assert the batched stat reports it; Galata follow-file.spec: assert it is applied within one interval
  - test-tags: INTEGRATION, FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-12` **An eventless path is checked every second** - HIGH; a path whose change the poll found and the watcher did not report is polled every second from then on
  - test: jest watcher.spec: report a change by the poll alone, assert the path's interval becomes 1 s
  - test-tags: UNIT
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-13` **The poll reads no content** - MEDIUM; a poll asks for a stat per path and never for content; content is read once per detected change
  - test: jest watcher.spec: run three quiet polls, assert no content request
  - test-tags: UNIT
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-14` **Registered on open, released on close** - HIGH; an editor registers its path when it opens and releases it when it closes; two editors of one file share one watch, and the server drops the watch when the last registration is gone
  - test: pytest test_watch.py: register a path twice, release once, assert the watch is held; release again, assert no watch
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-15` **Burst writes are coalesced** - HIGH; a truncate followed by a write, or two writes within 100 ms, produce one applied change, so the editor never shows a half-written file
  - test: Galata follow-file.spec: truncate the file and write it 50 ms later, sample the editor every 10 ms, assert no empty sample and one applied change
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-16` **Write by temporary file and rename is detected** - HIGH; a writer that renames a temporary file over the document triggers a change event like a write in place
  - test: pytest test_watch.py: write a temporary file in the directory, rename it over the path, assert a change event
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-17` **The channel reconnects and catches up** - HIGH; when the WebSocket drops, the extension reconnects with backoff, registers its documents again and checks each once, so a write during the gap is applied
  - test: Galata follow-file.spec: close the socket from the page, write the file, assert the change is applied after the reconnect
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-18` **Missing server side degrades to the poll** - HIGH; without the server extension, or without watchdog, every document is polled at pollInterval through the contents API, one console warning is logged and no other function is lost
  - test: jest watcher.spec: the channel answers 404, assert one warning and a poll that applies a change
  - test-tags: UNIT
  - log: 2026-10-12T13:24:00Z @kj added
- [ ] `ACC-EVENT-19` **Watch cost grows with directories** - MEDIUM; fifty registered files in one directory hold one observer on the server
  - test: pytest test_watch.py: register fifty paths in one directory, assert one observer; release all, assert none
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-EVENT-20` **Edge: symbolic link pointed elsewhere** - MEDIUM; a document opened through a symbolic link keeps raising change events after the link is pointed at another file
  - test: pytest test_watch.py: register a path behind a link, point the link at another file, write that file, assert a change event
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-EVENT-21` **Every route and the channel need credentials** - CRITICAL; each HTTP route and the WebSocket of the extension refuse a request without credentials
  - test: pytest test_routes.py: request each route with an empty Authorization header, assert 403; make test runs .github/scripts/check_auth.py
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-EVENT-22` **A path outside the server root is refused** - HIGH; a registration or a read for a path outside the server's root directory is refused, and nothing about that file is reported; origin: new, not in the brief
  - test: pytest test_routes.py: register ../outside.py and an absolute path outside the root, assert an error answer and no watch
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:01Z @kj added

## Applying a change in a live editor `APPLY`

Release 1. A change from disk lands in the file editor while the user types in it

- [ ] `ACC-APPLY-23` **Applied through the shared model** - CRITICAL; the disk text is written into the document's shared model in one transaction, so every view of the document shows it
  - test: jest apply.spec: apply a change, assert one transaction on the shared model and a model text equal to the disk text
  - test-tags: UNIT
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-24` **The cursor stays on its text** - CRITICAL; a disk change above or below the cursor leaves the cursor on the same character; origin: plan, release 1 outcome
  - test: Galata follow-file.spec: cursor on line 20 column 5, insert 3 lines at line 1 on disk, assert the cursor on line 23 column 5
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-25` **Typing continues through a disk change** - CRITICAL; characters the user types while a disk change is applied land where the user typed them, in order, with none lost; origin: user, the extension works while the user edits
  - test: Galata follow-file.spec: type 40 characters at 20 ms each on line 2 while lines are appended on disk, assert line 2 holds the 40 characters in order and the appended lines are present
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-26` **The selection stays on its text** - HIGH; a selection stays on the same characters after a disk change outside it
  - test: Galata follow-file.spec: select a word on line 20, insert 3 lines at line 1 on disk, assert the same word is selected
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-27` **The focus is not taken** - HIGH; a disk change moves the keyboard focus nowhere: the element that had the focus before the change has it after; origin: proposed in the brief, user has not answered
  - test: Galata follow-file.spec: focus editor A, write file B that is open beside it, assert document.activeElement is unchanged
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-28` **The text in view stays in place** - HIGH; a disk change outside the visible lines leaves the first visible line the same line at the same height
  - test: Galata follow-file.spec: scroll to the middle of a 500-line file, insert 50 lines at line 1 on disk, assert the first visible line's text, and its top offset within 1 px
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-29` **A disk change is not an undo step** - CRITICAL; undo after a disk change reverts the user's own last edit and leaves the disk change in the document; origin: proposed in the brief, user has not answered
  - test: Galata follow-file.spec: type X, write Y on disk, press Ctrl Z, assert X is gone and Y stays
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
  - log: 2026-10-12T13:24:40Z @kj the Markdown viewer rejected the same assertion, its criterion ACC-APPLY-15, because the editor tab was out of scope there; here the user edits in the followed document, which is the new reason
- [ ] `ACC-APPLY-30` **Redo crosses a disk change** - HIGH; an edit the user undid is restored by redo at its own place, also when a disk change landed in between; origin: new, not in the brief
  - test: Galata follow-file.spec: type X, undo, write Y on disk above it, redo, assert X is back on its line and Y is unchanged
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-31` **No File Changed dialog after an applied change** - CRITICAL; once the extension has applied a disk change, a save by the user succeeds without JupyterLab's File Changed dialog; origin: plan, release 1 outcome
  - test: Galata follow-file.spec: write on disk, type, press Ctrl S, assert no .jp-Dialog and a file holding both texts
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-32` **The automatic save raises no dialog either** - CRITICAL; after an applied disk change the automatic save succeeds without the File Changed dialog
  - test: Galata follow-file.spec: set autosaveInterval to 2 s, write on disk, type, wait 5 s, assert no .jp-Dialog and a file holding both texts
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:01Z @kj added
- [ ] `ACC-APPLY-33` **A save never overwrites an unapplied disk change** - CRITICAL; while the disk holds a change the extension has not applied, a save by the user or by the automatic save does not replace that change on disk
  - test: Galata follow-file.spec: block the extension's channel and poll, write on disk, type, press Ctrl S, assert the disk still holds the other program's text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-34` **Applied content leaves the document clean** - HIGH; a disk change applied to a document without unsaved edits leaves it without unsaved edits
  - test: Galata follow-file.spec: write on disk, assert model.dirty is false and the tab shows no unsaved mark
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-35` **Two editors of one file agree** - HIGH; a file open in two editors shows the same text and the same change display in both after a disk change
  - test: Galata follow-file.spec: open a.py in two editors side by side, write on disk, assert equal text and equal decorations
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-36` **The editor is never made read-only** - HIGH; the extension never makes an editor read-only, also while a change is displayed; origin: user, no viewer mode
  - test: Galata follow-file.spec: during a change display read the editor's read-only state, assert false; type a character, assert it lands
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-37` **Edge: whole file replaced** - MEDIUM; a rewrite that changes every line is applied as one change, and the editor keeps the focus
  - test: Galata follow-file.spec: replace all text on disk, assert the editor text equals the disk text and the editor still has the focus
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-38` **Edge: file emptied** - MEDIUM; a rewrite to an empty file leaves an empty editor and opens no error dialog
  - test: Galata follow-file.spec: truncate the file, assert an empty editor and no .jp-Dialog
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-39` **Edge: large file** - MEDIUM; a 5000-line file takes a disk change without blocking the main thread for more than 100 ms
  - test: Galata follow-file.spec: change one line of a 5000-line file on disk, measure the longest task with PerformanceObserver, assert 100 ms or less
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-APPLY-40` **Edge: line endings are kept** - MEDIUM; a file with CRLF line endings keeps them through an applied change and the save that follows
  - test: Galata follow-file.spec: write a CRLF fixture on disk, type, save, assert every line break on disk is CRLF
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added

## Unsaved edits `MERGE`

Release 1. Unsaved edits are kept by the Markdown viewer's rule: a disk change is applied around them

- [ ] `ACC-MERGE-41` **Unsaved text is never lost** - CRITICAL; text the user typed and has not saved is never removed or moved by a disk change
  - test: Galata unsaved-edits.spec: type on line 2 without saving, rewrite other lines on disk ten times, assert line 2 holds the typed text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-MERGE-42` **The last disk text is kept as the merge base** - CRITICAL; per document the text last agreed with disk is kept: set on load, on save and after every applied change, and used as the base of every merge; it is never shown and never written
  - test: jest merge.spec: load, type without saving, assert the base equals the disk text and not the model text
  - test-tags: UNIT
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-MERGE-43` **A disk change lands around unsaved edits** - CRITICAL; each hunk of a disk change that neither overlaps nor touches the user's unsaved edits is applied at its place
  - test: Galata unsaved-edits.spec: type on line 2 unsaved, rewrite lines 4 and 6 and append a line on disk, assert all four
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-MERGE-44` **An overlapping hunk keeps the user's text** - CRITICAL; where a hunk overlaps or touches unsaved edits the user's text stays and that hunk is dropped, while hunks on other lines land
  - test: Galata unsaved-edits.spec: edit line 5 unsaved, rewrite lines 5 and 1 on disk, assert the user's line 5 and the disk's line 1
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-MERGE-45` **A dropped hunk sets the held-back state** - HIGH; after a hunk was dropped the document is in the held-back state until the user saves or reloads
  - test: Galata unsaved-edits.spec: produce an overlap, assert the held-back tab class; press Ctrl S, assert it is gone
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:02Z @kj added
- [ ] `ACC-MERGE-46` **Saving keeps the user's version** - HIGH; a save after an overlap writes the user's text without the File Changed dialog
  - test: Galata unsaved-edits.spec: produce an overlap, press Ctrl S, assert no .jp-Dialog and a disk holding the user's line
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-MERGE-47` **Reload takes the file's version** - HIGH; Reload from Disk after an overlap takes the disk text and ends the held-back state
  - test: Galata unsaved-edits.spec: produce an overlap, run docmanager:reload and confirm, assert the disk's line and no held-back tab class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-MERGE-48` **A change is held while no merge base exists** - CRITICAL; a disk change arriving while the document holds unsaved edits typed over a revision the extension never saw is neither applied nor merged; the held-back state shows, and the change lands once the document is clean
  - test: jest merge.spec: a dirty model with no base receives a change, assert nothing applied and the held-back state; mark the model clean, assert the change lands
  - test-tags: UNIT
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-MERGE-49` **A merged document stays unsaved** - MEDIUM; after a disk change landed around unsaved edits the document still shows as unsaved, and the extension does not save it
  - test: Galata unsaved-edits.spec: merge a change, assert the unsaved mark on the tab and a disk without the user's text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-MERGE-50` **Edge: the same edit on both sides** - MEDIUM; when the user's unsaved edit and the disk change put the same text at the same place, the text appears once and no held-back state is set; origin: new, not in the brief
  - test: jest merge.spec: equal edits on both sides, assert one copy of the text and no held-back state
  - test-tags: UNIT
  - log: 2026-10-12T13:24:03Z @kj added

## Change display `HILITE`

Release 1. What a change from disk looks like in the editor: added text on green, removed text struck through on red

- [ ] `ACC-HILITE-51` **Added text is on green** - CRITICAL; text a disk change added has a green background in the editor
  - test: Galata change-display.spec: append a line on disk, assert the added-text class on exactly that range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-52` **Removed text is struck through on red** - CRITICAL; text a disk change removed is shown at its place, struck through on a red background, until the display leaves
  - test: Galata change-display.spec: delete a line on disk, assert a removed-text widget at its place holding that line's text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-53` **The display is drawn over applied text** - CRITICAL; the document holds the whole disk text from the first frame of the display; the display only paints; origin: proposed in the brief, user has not answered
  - test: Galata change-display.spec: write on disk, at the first frame that shows a decoration assert the model text equals the disk text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-54` **The display never edits the document** - CRITICAL; while a change is displayed the extension changes the document only by the one apply transaction; removed text is a widget, never characters of the document; origin: proposed in the brief, user has not answered
  - test: jest decorations.spec: apply a change and run the display to its end, assert one document-changing transaction and a model that never holds the removed text
  - test-tags: UNIT
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-55` **The user types inside displayed text** - HIGH; a character typed inside green text or beside a removed-text widget lands at the cursor, and the display stays on its own text; origin: new, not in the brief
  - test: Galata change-display.spec: put the cursor inside a green range, type, assert the character at the cursor and the green on the rest of the added text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-56` **The display follows edits elsewhere** - HIGH; when the user types above a displayed change, the green stays on the same characters; origin: new, not in the brief
  - test: Galata change-display.spec: display a change on line 10, type a new line at line 1, assert the green on the same text, now on line 11
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-57` **The display leaves after fadeDuration** - HIGH; the green and the red are gone fadeDuration milliseconds after the change, default 5000
  - test: Galata change-display.spec: write on disk, assert decorations at 1 s and none at 7 s; jest settings.spec: the default is 5000
  - test-tags: FUNCTIONAL, UNIT
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-58` **Colours follow the theme** - HIGH; the green and the red come from the extension's CSS variables, with light and dark values that keep the code readable in both stock themes
  - test: Galata change-display.spec: in the light and in the dark theme read the computed backgrounds, assert each theme's values and a text contrast of 4.5 to 1 or more
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-59` **The file and the model hold no display markup** - HIGH; after a displayed change the file on disk and the model text hold exactly the text the other program wrote
  - test: Galata change-display.spec: display a change, read the model and the file, assert both equal the written text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:03Z @kj added
- [ ] `ACC-HILITE-60` **One implementation for every editor** - HIGH; one CodeMirror extension, registered once through IEditorExtensionRegistry, paints changes and marks in the file editor and in every notebook cell editor
  - test: jest decorations.spec: assert one registered extension factory; Galata follow-notebook.spec: the same decoration classes appear in a cell editor
  - test-tags: UNIT, FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-HILITE-61` **Successive changes stack** - MEDIUM; a second disk change arriving while the first is displayed adds its own green and red beside the first
  - test: Galata change-display.spec: write twice 1 s apart, assert both ranges displayed at 1.5 s
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-HILITE-62` **Syntax colours stay** - MEDIUM; text on green keeps the token colours of its language
  - test: Galata change-display.spec: add a Python line on disk, assert a keyword token class inside the green range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-HILITE-63` **Edge: removed lines keep their line breaks** - MEDIUM; several removed lines are shown as struck-through lines, one per line, not joined into one; origin: new, not in the brief
  - test: Galata change-display.spec: delete 3 lines on disk, assert a removed-text widget of 3 lines
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-HILITE-64` **highlightVisibility sets the opacity** - MEDIUM; the setting highlightVisibility takes low, medium or high, default medium, and changes only the opacity of the green and the red, also on a display already on screen
  - test: Galata settings.spec: set each value, read the computed background opacity, assert low under medium under high
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-HILITE-65` **highlight off** - LOW; with the setting highlight false a disk change shows no green and no red, while following and the tab icon keep working
  - test: Galata settings.spec: set highlight false, write on disk, assert the new text, the tab icon and no decoration
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added

## Change animation `ANIM`

Release 1. Added text appears as if typed and removed text leaves letter by letter, as painting only

- [ ] `ACC-ANIM-66` **Added text is revealed as if typed** - HIGH; the green text of a disk change becomes visible character by character at animationSpeed characters per second, while the document holds all of it from the first frame
  - test: Galata change-display.spec: add a 60-character line on disk, sample the revealed length every 20 ms, assert it grows over several frames and the model is complete at the first
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-67` **Removed text leaves from its end** - HIGH; a removed-text widget stands whole, then loses its characters from the end, then is gone
  - test: Galata change-display.spec: delete a sentence on disk, sample the widget, assert the whole text, then a shrinking length, then no widget
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-68` **The animation is painting only** - HIGH; cursor movement, selection, search and copy reach the whole added text from the first frame of the animation; origin: proposed in the brief, user has not answered
  - test: Galata change-display.spec: during the reveal press Ctrl A and Ctrl C, assert the clipboard holds the whole disk text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-69` **Distant changes animate together** - HIGH; when one write changes several places, every added range is revealed and every removed-text widget leaves at the same time
  - test: Galata change-display.spec: change lines 1 and 200 in one write, assert both revealed lengths grow in the same samples
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-70` **A write during an animation continues it** - MEDIUM; when the next write arrives during a reveal, text already revealed stays revealed and only the new text is revealed
  - test: Galata change-display.spec: write twice within the reveal, assert the first range's revealed length never falls
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-71` **animationSpeed** - HIGH; the setting animationSpeed is in characters per second, default 75; 0 shows added text and removes removed text at once
  - test: jest settings.spec: the default is 75; Galata settings.spec: set 0, write on disk, assert the whole range revealed in the first frame
  - test-tags: UNIT, FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-72` **animationJitter** - MEDIUM; the setting animationJitter, 0 to 1, default 0.25, varies the time per character by up to that share of it and keeps the speed on average
  - test: jest animate.spec: with the random draw fixed high and low, assert 1.25 and 0.75 times the even time for 40 characters; jitter 0 gives the even time
  - test-tags: UNIT
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-73` **animation off** - MEDIUM; with the setting animation false a change shows whole at once, while green, red and the tab icon keep working
  - test: Galata settings.spec: set animation false, write on disk, assert the whole range revealed in the first frame and the added-text class present
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added
- [ ] `ACC-ANIM-74` **Motion is stopped by the extension's settings only** - MEDIUM; the animation and the turning tab icon run whatever the operating system's reduced-motion preference is; animation false and tabCue false stop them
  - test: Galata settings.spec: emulate prefers-reduced-motion reduce, write on disk, assert the reveal still takes several frames
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:04Z @kj added

## Tab icons `CUE`

Release 1. The document tab shows that the file changed, that a change was held back, or that the file is deleted

- [ ] `ACC-CUE-75` **Changed icon** - HIGH; after an applied disk change the tab shows a half-filled circle before its label
  - test: Galata tab-cue.spec: write on disk while another tab is in front, assert the changed class and the circle
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-76` **Held-back icon** - HIGH; a change held back or dropped over unsaved edits shows a red square in the same place, and the tab's tooltip names the state
  - test: Galata tab-cue.spec: produce an overlap, assert the held-back class, the square and the tooltip words
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-77` **Deleted icon** - MEDIUM; a file deleted on disk shows a cross on its tab until the tab closes or the file is back
  - test: Galata tab-cue.spec: delete the file, assert the deleted class; recreate it, assert the class is gone
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-78` **The changed icon clears on attention** - HIGH; the changed icon clears when the user activates the tab and scrolls, clicks or types in it; on the tab in front it clears once the writer was quiet for the settle time plus fadeDuration
  - test: Galata tab-cue.spec: write while another tab is in front, switch back, click in the editor, assert no icon class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-79` **The circle turns at the rate of changes** - MEDIUM; while changes arrive the circle alternates between its two halves; a frame lasts from 1 s down to 0.25 s as changes come more often
  - test: jest cue.spec: feed changes 1 s, 500 ms and 250 ms apart, assert the frame class for each and none after the quiet time
  - test-tags: UNIT
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-80` **The tooltip keeps the tab's own lines** - MEDIUM; a tab icon's tooltip puts the state's words above the tab's own caption lines Name, Path and Last Saved, which stay
  - test: Galata tab-cue.spec: after an applied change read the tab's title attribute, assert the state words and the Path line
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CUE-81` **tabCue off** - LOW; with the setting tabCue false no tab icon is shown, while following and the change display keep working
  - test: Galata settings.spec: set tabCue false, write on disk, assert the new text and no icon class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added

## Settings and no mode `CONFIG`

Release 1. Settings switch single functions on and off; the extension has no viewer widget and no mode

- [ ] `ACC-CONFIG-82` **No viewer widget** - CRITICAL; the extension registers no document widget factory: Open With on a source file and on a notebook lists no entry of this extension; origin: user
  - test: Galata settings.spec: right-click a.py and n.ipynb in the file browser, open Open With, assert the entries of a lab without this extension and no other
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-83` **No mode** - CRITICAL; no command, toolbar button or setting puts a document into a viewing or review mode; every function runs in the normal file editor and notebook; origin: user
  - test: Galata settings.spec: open a.py with no further action, write on disk, assert the change is displayed and a typed character lands
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-84` **enabled** - HIGH; with the setting enabled false the extension follows no document, paints nothing and shows no tab icon, without a restart; true resumes
  - test: Galata settings.spec: set enabled false, write on disk, assert the old text; set true, write again, assert the new text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-85` **Setting names are the Markdown viewer's** - HIGH; the schema declares enabled, pollInterval, highlight, highlightVisibility, fadeDuration, animation, animationSpeed, animationJitter and tabCue with the Markdown viewer's types and defaults; origin: proposed in the brief, user has not answered
  - test: jest settings.spec: compare the nine keys, types and defaults of schema/plugin.json with the listed values
  - test-tags: UNIT
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-86` **pollInterval** - MEDIUM; the setting pollInterval is the fallback interval in seconds, default 10, minimum 1, and a new value applies to open documents
  - test: jest settings.spec: default 10 and minimum 1; jest watcher.spec: change the setting, assert the next poll at the new interval
  - test-tags: UNIT
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-87` **Settings are validated** - MEDIUM; the schema gives every setting its type, default and limits, so the settings editor rejects an invalid value
  - test: Galata settings.spec: enter pollInterval 0 in the settings editor, assert the error under the field and the stored value unchanged
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added
- [ ] `ACC-CONFIG-88` **A setting change needs no reopen** - MEDIUM; a changed setting takes effect on documents that are already open
  - test: Galata settings.spec: with a.py open set highlight false, write on disk, assert no decoration
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:05Z @kj added

## Working beside other extensions `COMPAT`

Release 1. The extension works beside jupyterlab-lsp, jupyterlab_git, the refresh view and colourful tab extensions and the two viewers

- [ ] `ACC-COMPAT-89` **A file two extensions follow is applied once** - CRITICAL; a .md file open in the file editor and in the Markdown Preview, with the advanced Markdown viewer installed, takes a disk change once: the model equals the disk text; origin: new, not in the brief
  - test: Galata siblings.spec: open a.md in editor and preview, append a line on disk, assert a model text equal to the disk text, the line in it once
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-90` **A Markdown file in the editor is a source file** - HIGH; a .md file open in the file editor is followed and displayed like any source file
  - test: Galata siblings.spec: open a.md in the file editor only, write on disk, assert the new text and the green range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-91` **An HTML file in the editor is a source file** - HIGH; a .html file open in the file editor is followed and displayed like any source file
  - test: Galata siblings.spec: open a.html with the Editor factory, write on disk, assert the new text and the green range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-92` **Editor and Markdown Preview show one state** - HIGH; a .md file open in the editor and in the Markdown Preview shows the same text in both after a disk change and after the user types
  - test: Galata siblings.spec: write on disk, then type in the editor, assert the preview's text matches the editor's each time
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-93` **jupyterlab-lsp keeps its diagnostics** - HIGH; with jupyterlab-lsp active on a Python file its diagnostic underlines are present before, during and after a change display
  - test: Galata siblings.spec: open a .py fixture with an undefined name, assert the diagnostic mark; write on disk, assert it during and after the display
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-94` **jupyterlab_git keeps what it draws** - HIGH; what jupyterlab_git draws in an editor of a tracked file is still drawn after a disk change
  - test: Galata siblings.spec: open a tracked file of a git fixture, record the elements jupyterlab_git added to the editor, write on disk, assert the same elements
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-95` **Refresh view never drops unsaved edits silently** - MEDIUM; the refresh view extension's command on a document with unsaved or merged edits asks before it reverts them
  - test: Galata siblings.spec: type without saving, run the refresh view command, assert a prompt and the typed text still present
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-96` **Colourful tabs keep their colour** - MEDIUM; with the colourful tab extension a tab keeps its colour while it shows a tab icon
  - test: Galata siblings.spec: write on disk, assert the tab's colour style and the icon class together
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-97` **Other extensions' context menu entries stay** - CRITICAL; the extension only adds context menu entries; it never consumes, cancels or stops a contextmenu event, so entries of other extensions in the editor and the notebook are still offered
  - test: Galata siblings.spec: register a test command on the editor's selector, right-click in the editor, assert its entry beside this extension's
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-98` **A write by another extension is not a disk change** - HIGH; a whole-document change another extension makes in the browser produces no green, no red and no tab icon
  - test: Galata siblings.spec: call setSource on the shared model from the page, assert no decoration and no tab icon class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-COMPAT-99` **The two viewers keep working** - MEDIUM; with this extension installed a mark made in the Markdown Preview is written as before, and the file editor of the same file shows the marker text
  - test: Galata siblings.spec: mark a passage in the preview of a.md, assert both markers on disk and in the editor's text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added

## Following a notebook's cells `CELLS`

Release 2. An open notebook follows the cells of the file on disk and is changed in place, not reloaded

- [ ] `ACC-CELLS-100` **Open notebooks are followed** - CRITICAL; every notebook open in the notebook editor is followed for a change on disk while its tab exists
  - test: Galata follow-notebook.spec: open n.ipynb, rewrite it on disk, assert the new cell source without a reload
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-CELLS-101` **The notebook is changed in place** - CRITICAL; a disk change is made by cell operations on the shared model; the notebook widget and the cell widgets of unchanged cells are the same objects afterwards
  - test: Galata follow-notebook.spec: tag the DOM node of cell 1, change cell 3 on disk, assert the tagged node is still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-CELLS-102` **A cell added on disk appears** - CRITICAL; a cell added to the file appears in the open notebook at its position
  - test: Galata follow-notebook.spec: insert a cell at index 2 on disk, assert the cell count and the source at index 2
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:06Z @kj added
- [ ] `ACC-CELLS-103` **A cell removed on disk disappears** - CRITICAL; a cell removed from the file leaves the open notebook, and the other cells keep their widgets
  - test: Galata follow-notebook.spec: remove cell 2 on disk, assert the cell count and that cell 3's tagged node is still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-104` **A cell moved on disk moves** - HIGH; a cell moved in the file shows at its new position with its id, source and outputs
  - test: Galata follow-notebook.spec: move cell 1 to the end on disk, assert the order of the ids
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-105` **A changed source is applied in its cell** - CRITICAL; a cell source changed on disk is applied in that cell and displayed as in a source file: added text on green, removed text struck through on red
  - test: Galata follow-notebook.spec: change one line of a code cell on disk, assert the source and both decoration classes in that cell's editor
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-106` **Edge: cell type changed on disk** - MEDIUM; a cell whose type changed in the file shows as the new type with the disk source; origin: new, not in the brief
  - test: Galata follow-notebook.spec: turn a code cell into a Markdown cell on disk, assert the cell's type and source
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-107` **Cells are matched by id** - CRITICAL; a cell of the file is the cell of the open notebook that has the same id, whatever its position or content
  - test: jest cells.spec: match two cell lists with moved and changed cells, assert the pairs by id
  - test-tags: UNIT
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-108` **A notebook without ids is matched by content** - HIGH; in a notebook whose cells carry no id, cells are matched by content, so an unchanged cell is not replaced
  - test: jest cells.spec: match two lists without ids, one cell changed and one added, assert the unchanged cells pair up
  - test-tags: UNIT
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-109` **Edge: every id rewritten** - MEDIUM; when a writer gives every cell a new id and leaves the content, cells are matched by content and no cell widget is replaced; origin: new, not in the brief
  - test: Galata follow-notebook.spec: rewrite all ids on disk, assert every tagged cell node is still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-110` **The scroll position stays** - CRITICAL; a disk change outside the visible cells leaves the first visible cell at the same height
  - test: Galata follow-notebook.spec: scroll to cell 30 of 60, insert 5 cells at the top on disk, assert the first visible cell, and its top offset within 1 px
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-111` **The active cell and the selection stay** - CRITICAL; the active cell and the selected cells are the same cells after a disk change
  - test: Galata follow-notebook.spec: select cells 4 to 6 with 5 active, insert a cell at the top on disk, assert the same ids selected and active
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-112` **The cell being edited stays in edit mode** - CRITICAL; while the user types in a cell, a disk change to other cells leaves that cell in edit mode, with the focus in it and its cursor on the same character
  - test: Galata follow-notebook.spec: type in cell 5 while cell 2 changes on disk, assert edit mode, the cursor offset and the typed text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-113` **The kernel session stays** - CRITICAL; the notebook keeps its kernel session through a disk change: the same kernel id, and variables set before are still set
  - test: Galata follow-notebook.spec: run x = 1, change the notebook on disk, read the kernel id and evaluate x, assert the same id and 1
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-114` **The extension starts no execution** - CRITICAL; applying a disk change sends no execute request to the kernel
  - test: Galata follow-notebook.spec: count execute_request messages on the kernel during ten disk changes, assert zero
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-115` **Command mode and edit mode** - HIGH; a disk change is applied and displayed while the notebook is in command mode and while it is in edit mode; origin: user
  - test: Galata follow-notebook.spec: make one disk change in each mode, assert the source and the decorations both times
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:07Z @kj added
- [ ] `ACC-CELLS-116` **Rendered and unrendered Markdown cells** - HIGH; a changed Markdown cell shows its new rendering when rendered, and its new source with the change display when unrendered; origin: user
  - test: Galata follow-notebook.spec: change a Markdown cell on disk in each state, assert the rendered text and the editor decorations
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-117` **An untouched cell takes the disk version** - CRITICAL; a cell without unsaved edits takes the source the file holds
  - test: Galata follow-notebook.spec: with unsaved edits in cell 1, change cell 2 on disk, assert cell 2 holds the disk source
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-118` **A cell with unsaved edits is merged** - CRITICAL; a cell with unsaved edits takes a disk change by the source-file rule: hunks land around the edits, an overlapping hunk is dropped, and the tab shows the red square
  - test: Galata follow-notebook.spec: edit line 1 of cell 2 unsaved, change lines 1 and 3 of it on disk, assert the user's line 1, the disk's line 3 and the held-back class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-119` **An unsaved new cell is kept** - HIGH; a cell the user added and has not saved stays in place when a disk change arrives; origin: new, not in the brief
  - test: Galata follow-notebook.spec: add a cell without saving, change another cell on disk, assert the added cell and its source
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-120` **Edge: unsaved deletion of a cell changed on disk** - MEDIUM; a cell the user deleted without saving, and the file then changed, stays deleted, and the tab shows the red square; origin: new, not in the brief
  - test: Galata follow-notebook.spec: delete cell 2 without saving, change cell 2 on disk, assert it is absent and the held-back class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-121` **No File Changed dialog on a notebook** - CRITICAL; once a disk change is applied, a save of the notebook succeeds without the File Changed dialog
  - test: Galata follow-notebook.spec: change on disk, type in a cell, press Ctrl S, assert no .jp-Dialog and both changes on disk
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-122` **The automatic save meets the agent's write** - CRITICAL; the automatic save never overwrites a disk change the extension has not applied, and raises no dialog for one it has applied
  - test: Galata follow-notebook.spec: autosaveInterval 2 s, rewrite the notebook on disk ten times 700 ms apart while typing in a cell, assert no .jp-Dialog and a file holding the last rewrite and the typed text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-123` **A disk change is not a notebook undo step** - HIGH; notebook undo, of cells and inside a cell, reverts the user's own edits only; origin: proposed in the brief, user has not answered
  - test: Galata follow-notebook.spec: add a cell, insert another on disk, press Z in command mode, assert the user's cell is gone and the disk's cell stays
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
  - log: 2026-10-12T13:24:40Z @kj the Markdown viewer rejected the same assertion, its criterion ACC-APPLY-15, because the editor tab was out of scope there; here the user edits in the followed document, which is the new reason
- [ ] `ACC-CELLS-124` **Metadata changed on disk is applied** - HIGH; a change to a cell's metadata or to the notebook's metadata in the file is applied to the open notebook; origin: new, not in the brief
  - test: Galata follow-notebook.spec: add a tag to a cell and a key to the notebook metadata on disk, assert both in the model
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-125` **An applied change leaves the notebook clean** - HIGH; a disk change applied to a notebook without unsaved edits leaves it without unsaved edits
  - test: Galata follow-notebook.spec: change on disk, assert model.dirty is false and the tab shows no unsaved mark
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-126` **Tab icons on a notebook tab** - MEDIUM; a notebook's tab shows the changed, held-back and deleted icons by the rules of a source file's tab
  - test: Galata follow-notebook.spec: change on disk behind another tab, assert the changed class; delete the file, assert the deleted class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-127` **Edge: half-written notebook** - HIGH; a file that is not valid notebook JSON when it is read applies nothing and raises no error; the next complete write is applied; origin: new, not in the brief
  - test: pytest test_notebook_delta.py: read a truncated file, assert no delta and no exception; Galata follow-notebook.spec: write half the file, then all of it, assert the final cells
  - test-tags: INTEGRATION, FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added
- [ ] `ACC-CELLS-128` **Two views of one notebook agree** - MEDIUM; a notebook open in two views shows the same cells and outputs in both after a disk change; origin: new, not in the brief
  - test: Galata follow-notebook.spec: open New View for Notebook, change on disk, assert equal sources in both views
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:08Z @kj added

## Following a notebook's outputs `OUTPUT`

Release 2. Outputs and execution counts follow the file; a cell the lab's kernel is executing keeps its live output

- [ ] `ACC-OUTPUT-129` **Outputs are replaced** - CRITICAL; outputs of a code cell changed in the file replace that cell's outputs in the open notebook
  - test: Galata notebook-outputs.spec: change a cell's stream output on disk, assert the new output text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-130` **Execution counts are replaced** - CRITICAL; an execution count changed in the file shows in the cell's prompt
  - test: Galata notebook-outputs.spec: set execution_count 7 on disk, assert the prompt [7]
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-131` **nbconvert executes an open notebook** - CRITICAL; after jupyter nbconvert --to notebook --execute --inplace on a notebook that is open, the open notebook shows the new outputs and execution counts without a reload; origin: user, the first case
  - test: Galata nbconvert.spec: open an unexecuted notebook, run the command on its file, assert each cell's output and prompt
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-132` **nbconvert replaces no cell** - HIGH; after nbconvert executed the file, every cell of the open notebook is the same widget as before: cells are matched, and only outputs and counts change
  - test: Galata nbconvert.spec: tag every cell node, run the command, assert every tagged node is still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-133` **An executing cell keeps its live output** - CRITICAL; a cell the lab's kernel is executing keeps its live output; a disk change to that cell's output is held back and the tab shows the red square
  - test: Galata notebook-outputs.spec: run a cell that prints for 5 s, change its output on disk meanwhile, assert the live output keeps growing and the held-back class
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-134` **A replaced output shows a coloured band** - HIGH; a cell whose output was replaced from disk shows a coloured band beside that output, with no typing animation
  - test: Galata notebook-outputs.spec: replace an output on disk, assert the band class on the output area and the whole output text in the first frame
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-135` **A new cell shows a coloured band** - HIGH; a cell added from disk shows a coloured band beside the cell, with no typing animation
  - test: Galata follow-notebook.spec: insert a cell on disk, assert the band class on the cell and its whole source in the first frame
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-136` **A band leaves after fadeDuration** - MEDIUM; the coloured band of a replaced output or a new cell is gone fadeDuration milliseconds after the change
  - test: Galata notebook-outputs.spec: replace an output, assert the band at 1 s and none at 7 s
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-137` **Edge: outputs cleared on disk** - MEDIUM; a cell whose outputs and execution count were cleared in the file shows no output and an empty prompt; origin: new, not in the brief
  - test: Galata notebook-outputs.spec: clear a cell's outputs on disk, assert no output node and the prompt [ ]
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-138` **Outputs of other cells are left alone** - HIGH; a disk change to one cell leaves the output nodes of every other cell attached, so a picture there is not drawn again; origin: new, not in the brief
  - test: Galata notebook-outputs.spec: tag an image output of cell 1, replace cell 2's output on disk, assert the tagged node is still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-OUTPUT-139` **An output from disk gets the cell's trust** - CRITICAL; an output applied from disk is shown with the trust JupyterLab gives that cell on load: a script or HTML output of an untrusted cell does not run; origin: new, not in the brief
  - test: Galata notebook-outputs.spec: write on disk a cell whose HTML output sets window.acvRan, without signing the notebook, assert window.acvRan is undefined
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:09Z @kj added

## Notebook changes from server to browser `DELTA`

Release 2. Only changed cells travel from the server to the browser, so a notebook with large outputs stays responsive

- [ ] `ACC-DELTA-140` **Only changed cells are sent** - CRITICAL; for a notebook change the server sends the added, removed, moved and changed cells only; an unchanged cell's source and outputs are not sent
  - test: pytest test_notebook_delta.py: change one source in a notebook holding 20 MB of outputs, assert a message under 10 kB
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-DELTA-141` **The delta gives the file** - CRITICAL; applying the server's delta to the version the browser holds gives a notebook equal to the file: cells, order, outputs, execution counts and metadata
  - test: pytest test_notebook_delta.py: 200 generated edits of cells, moves, outputs and metadata, assert the patched notebook equals the file each time
  - test-tags: UNIT
  - log: 2026-10-12T13:24:09Z @kj added
- [ ] `ACC-DELTA-142` **An unknown base gets the whole notebook** - HIGH; when the server does not know the version the browser holds, as after a server restart, the browser takes the whole notebook once and applies it by cell matching; origin: new, not in the brief
  - test: pytest test_notebook_delta.py: ask for a delta from an unknown base, assert a full answer; jest cells.spec: apply a full notebook, assert unchanged cells keep their objects
  - test-tags: UNIT
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-DELTA-143` **Large outputs do not block the page** - HIGH; a change to one cell of a notebook holding 50 MB of outputs is applied without blocking the main thread for more than 100 ms
  - test: Galata notebook-outputs.spec: change one source on disk in the 50 MB fixture, measure the longest task, assert 100 ms or less
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-DELTA-144` **A replaced output is sent alone** - MEDIUM; when one output of 5 MB is replaced in the file, that output is sent once and no other output is sent
  - test: pytest test_notebook_delta.py: replace one 5 MB output among ten, assert the message holds that output alone
  - test-tags: UNIT
  - log: 2026-10-12T13:24:10Z @kj added

## With jupyter-collaboration `COLLAB`

Release 2. Where jupyter-collaboration is installed the extension leaves the replacing of the document to it

- [ ] `ACC-COLLAB-145` **jupyter-collaboration is detected** - HIGH; where jupyter-collaboration is installed the extension detects it and does not itself apply disk changes to a document
  - test: jest watcher.spec: with a collaborative shared model deliver a change, assert the extension applies nothing
  - test-tags: UNIT
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-COLLAB-146` **A disk change shows once under collaboration** - MEDIUM; with jupyter-collaboration installed a disk change appears in the open document once, with no duplicate text
  - test: manual: install jupyter-collaboration in a scratch environment, open a.py, append a line on disk, read the editor text
  - test-tags: MANUAL
  - log: 2026-10-12T13:24:10Z @kj added

## README statements `README`

Each release. Statements the brief requires in the README

- [ ] `ACC-README-147` **README names the limits** - MEDIUM; the README lists as limits: no accept or reject of a single change, no separate read-only viewer, no notes in a separate file, no shared notes package
  - test: manual: read the Limitations section of README.md, find the four limits
  - test-tags: MANUAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-README-148` **README states where nbconvert outputs come from** - MEDIUM; the README states that outputs written by nbconvert come from another kernel process, so the lab's kernel does not hold those variables
  - test: manual: read README.md, find the statement
  - test-tags: MANUAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-README-149` **README states what stays under jupyter-collaboration** - LOW; the README names the functions that stay active where jupyter-collaboration is installed
  - test: manual: read README.md, find the list of functions
  - test-tags: MANUAL
  - log: 2026-10-12T13:24:10Z @kj added

## Marking in the editor `MARK`

Release 3. Marking a passage of a source file in the file editor, while typing

- [ ] `ACC-MARK-150` **A selection is marked from the context menu** - CRITICAL; selecting text in the file editor and choosing a colour under Mark in the context menu writes a mark around that text
  - test: Galata marks-file.spec: select a word in a.py, choose Mark and yellow, assert the markers in the document and the painted range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-MARK-151` **Six colours** - HIGH; the Mark submenu offers yellow, blue, pink, orange, red and green, each with its swatch; the chosen colour is stored in the marker and painted
  - test: Galata marks-file.spec: mark with each colour, assert colour= in the marker and the paint class of that colour
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-MARK-152` **Add Comment** - HIGH; Add Comment in the context menu marks the selection in yellow and opens the note field of the new mark in the notes panel
  - test: Galata marks-file.spec: choose Add Comment, assert the marker and a focused note field
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-MARK-153` **Entries need a selection** - HIGH; without a selection the Mark submenu and Add Comment are hidden
  - test: Galata marks-file.spec: right-click with no selection, assert both entries hidden
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-MARK-154` **Keyboard marking** - MEDIUM; Accel Shift M marks the selection in yellow; the command is in the palette, enabled only with a selection that can take a mark
  - test: Galata marks-file.spec: select a word, press Control Shift M, assert the markers
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:10Z @kj added
- [ ] `ACC-MARK-155` **Marked text is painted** - CRITICAL; the marked text has the background of the mark's colour in the editor
  - test: Galata marks-file.spec: mark a word, assert the paint class on exactly that word
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-156` **One compact marker per mark** - CRITICAL; a mark shows as painted text plus one compact marker; its comment lines are not shown as raw lines; origin: proposed in the brief, user has not answered
  - test: Galata marks-file.spec: mark a word, assert one marker widget and no visible line holding mark:
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-157` **The cursor passes a marker as one unit** - CRITICAL; arrow keys, Backspace and Delete treat a compact marker as one unit, and no typed character can land inside it; origin: proposed in the brief, user has not answered
  - test: Galata marks-typing.spec: move across a marker with the arrow keys and type at each stop, assert both marker lines unchanged in the document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-158` **A setting shows the raw lines** - HIGH; a setting shows every marker as its raw comment lines instead of the compact marker; origin: proposed in the brief, user has not answered
  - test: Galata marks-file.spec: turn the setting on, assert the marker lines visible and no marker widget
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-159` **Marking needs no mode** - HIGH; a mark can be written from the normal editor while the document holds unsaved edits and while another program writes the file; origin: user
  - test: Galata marks-typing.spec: type without saving, append a line on disk, mark a word, assert the mark, the typed text and the appended line
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-160` **Marking leaves the view in place** - HIGH; writing a mark neither scrolls the editor nor moves the first visible line
  - test: Galata marks-file.spec: scroll to the middle, mark a word, assert the first visible line, and its top offset within 1 px
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-161` **Marking clears the selection** - MEDIUM; once a mark is written the editor holds no selection
  - test: Galata marks-file.spec: mark a word, assert an empty selection
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-162` **Hover shows the notes** - MEDIUM; hovering marked text shows the mark's notes as a tooltip, one line per note with its author; a mark without notes shows none
  - test: Galata marks-file.spec: hover a mark with two notes, assert both lines; hover a mark without notes, assert no tooltip
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-163` **A click on a compact marker** - MEDIUM; a click on the compact marker of a mark without notes opens its note field; on a mark with notes it opens the mark's row and starts no note
  - test: Galata marks-file.spec: click the marker of each kind, assert the note field or the open row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-164` **Overlapping marks** - MEDIUM; two marks over overlapping text are both kept, both listed and both painted, with all four markers intact
  - test: Galata marks-file.spec: mark two overlapping selections, assert two rows and four markers
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-165` **Code stays readable with many marks** - MEDIUM; with 50 marks in a 200-line file every code line is on its own line with its token colours, and no raw marker line is visible
  - test: Galata marks-file.spec: open the 50-mark fixture, assert 200 visible code lines, 50 marker widgets and no visible mark: text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-166` **Mark colours follow the theme** - MEDIUM; marked text is a faint wash from the extension's CSS variables in the light and in the dark stock theme, and the code on it stays readable
  - test: Galata marks-file.spec: in both themes read the paint background, assert each theme's value and a text contrast of 4.5 to 1 or more
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-167` **notes off** - HIGH; with the setting notes false the panel, the paint, the compact markers and the menu entries are gone, and the markers in the file are untouched and shown as plain comment lines
  - test: Galata settings.spec: set notes false on a marked file, assert no panel, no paint, visible marker lines and an unchanged file
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:11Z @kj added
- [ ] `ACC-MARK-168` **notes and author are settings** - MEDIUM; the schema declares notes, boolean, default true, and author, string, default empty, as the Markdown viewer does
  - test: jest settings.spec: compare both keys, types and defaults with the listed values
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added

## Storage in a source file `STORE`

Release 3. A note is stored in the source file as comment lines of the file's language, in the Markdown viewer's mark grammar

- [ ] `ACC-STORE-169` **Notes live in the file** - CRITICAL; a mark and its notes are written into the source file itself; no other file is created or changed
  - test: Galata marks-file.spec: mark and comment, list the directory, assert the same files as before and the markers in a.py
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-170` **Markers are comment lines of the language** - CRITICAL; markers are comment lines in the comment syntax the editor's language declares: # in Python, // in TypeScript; origin: plan
  - test: jest comment-syntax.spec: for Python, TypeScript, Rust, shell and YAML assert the marker line starts with the language's line comment token
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-171` **The grammar is the Markdown viewer's** - CRITICAL; inside the comment a marker reads as in the Markdown viewer: mark:<uuid> note colour=<colour>, optional status=closed, closing /mark:<uuid>, note lines @handle <UTC stamp>: text; origin: plan
  - test: jest marks.spec: serialise and parse a mark with colour, status and two notes in each comment syntax, assert equal fields
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-172` **The identifier is a UUID found twice** - HIGH; a mark's identifier is a version 4 UUID and occurs exactly twice in the file, in its opening and its closing marker
  - test: Galata marks-file.spec: mark three words, assert each identifier is a version 4 UUID occurring twice
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-173` **Whole lines sit between two marker lines** - HIGH; a mark over whole lines has its opening marker on a line of its own above the first and its closing marker on a line of its own below the last
  - test: Galata marks-file.spec: select lines 3 to 5, mark, assert marker lines at 3 and 7 and the three code lines unchanged between them
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-174` **Part of a line is a column range in the marker** - HIGH; when a mark covers part of a line the opening marker holds the column range of the marked text, and the code line itself gains no character; origin: plan
  - test: Galata marks-file.spec: mark one word in a line, assert the range in the marker and the code line byte for byte as before
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-175` **Only marker lines change the file** - CRITICAL; deleting every marker line from a marked file gives back the original file byte for byte
  - test: Galata marks-file.spec: mark three passages, strip the marker lines from the file, compare with the original
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-176` **A note is one comment line** - HIGH; each note is one comment line @<handle> <UTC ISO stamp>: <text> after the opening marker line; a line break in a note continues on the next comment line
  - test: jest marks.spec: serialise a two-line note, assert two comment lines; parse them, assert one note with its line break
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-177` **Languages with block comments only** - MEDIUM; in a language that has block comments only, such as CSS, each marker is one block comment, and the comment's end token inside a note is written apart so it never ends the comment; origin: new, not in the brief
  - test: jest comment-syntax.spec: serialise a note holding */ for CSS, assert one comment and the same text after parsing
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-178` **Markdown and HTML files take HTML comments** - HIGH; in a .md or .html file open in the file editor a mark is the HTML comment pair the two viewers write, in their exact form, so the Markdown Preview and the HTML viewer list it
  - test: Galata siblings.spec: mark a word of a.md in the file editor, open the Markdown Preview, assert its notes panel lists the mark
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-179` **Where a note on the whole file goes** - MEDIUM; a note on the whole file is an opening marker of type document with no closing marker, at the top of the file, below a shebang line and an encoding line where the file has them; origin: new, not in the brief
  - test: jest placement.spec: place a document note in a file with a shebang and a coding line, assert it on line 3
  - test-tags: UNIT
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-180` **Edge: CRLF line endings** - MEDIUM; in a file with CRLF line endings every marker line ends in CRLF, and no marker is written between CR and LF
  - test: Galata marks-file.spec: mark a CRLF fixture, assert every line break on disk is CRLF
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:12Z @kj added
- [ ] `ACC-STORE-181` **Marker lines take the code's indentation** - MEDIUM; a marker on a line of its own is indented as the code line it stands beside; origin: new, not in the brief
  - test: jest placement.spec: mark an indented Python block, assert the marker lines start at the block's column
  - test-tags: UNIT
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-STORE-182` **A note reaches a clean file at once** - CRITICAL; on a document without other unsaved edits a mark or a note is on disk within 2 s without the user saving, and the document shows no unsaved edits afterwards
  - test: Galata marks-file.spec: mark a word in a clean file, poll the file, assert the markers within 2 s and no unsaved mark on the tab
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-STORE-183` **A note never saves the user's edits** - CRITICAL; on a document with other unsaved edits a mark is written into the document only, and reaches the file with the user's next save
  - test: Galata marks-typing.spec: type without saving, mark, assert the file unchanged; press Ctrl S, assert the typed text and the markers on disk
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-STORE-184` **Writing a mark raises no dialog** - CRITICAL; a marker write on a clean document first applies a disk change that is waiting, then writes; no File Changed dialog opens
  - test: Galata marks-file.spec: write the file on disk and mark at once, assert no .jp-Dialog and a file holding both
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-STORE-185` **Unknown types and attributes are kept** - MEDIUM; a mark of a type this version does not write is listed and never rewritten, and attributes it does not know keep their order when the marker is rewritten
  - test: jest marks.spec: rewrite a marker holding owner=agent due=2026-09-30, assert both in order; assert a task mark is not rewritten
  - test-tags: UNIT
  - log: 2026-10-12T13:24:13Z @kj added

## Markers never change the program `SAFE`

Release 3. A marker never changes what the program does; where it would, it goes outside or the mark is refused

- [ ] `ACC-SAFE-186` **Python: a marked file runs the same** - CRITICAL; a Python file with marks, one of them on text inside a triple-quoted string, prints the same output as the file without them
  - test: Galata marker-safety.spec: mark through the editor, run python on the file and on the original, assert equal output; pytest test_marker_safety.py runs the committed pair
  - test-tags: FUNCTIONAL, INTEGRATION
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-187` **Shell: a marked file runs the same** - CRITICAL; a shell script with marks, one of them on text inside a here-document, prints the same output as the script without them
  - test: Galata marker-safety.spec: mark through the editor, run bash on both files, assert equal output; pytest test_marker_safety.py runs the committed pair
  - test-tags: FUNCTIONAL, INTEGRATION
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-188` **JavaScript: a marked file runs the same** - CRITICAL; a JavaScript file with marks, one of them on text inside a template literal, prints the same output as the file without them
  - test: Galata marker-safety.spec: mark through the editor, run node on both files, assert equal output; pytest test_marker_safety.py runs the committed pair
  - test-tags: FUNCTIONAL, INTEGRATION
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-189` **YAML: a marked file parses the same** - HIGH; a YAML file with marks, one of them on text inside a block scalar, parses to the same data as the file without them
  - test: Galata marker-safety.spec: mark through the editor, parse both files, assert equal data; pytest test_marker_safety.py parses the committed pair
  - test-tags: FUNCTIONAL, INTEGRATION
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-190` **No marker line inside a multi-line string** - CRITICAL; for a selection inside a multi-line string, a here-document or a template literal the marker lines are placed outside that construct, or the mark is refused; a marker line is never written inside it
  - test: jest placement.spec: selections inside each construct in Python, shell and JavaScript, assert marker lines outside it or a refusal
  - test-tags: UNIT
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-191` **No marker line after a line continuation** - HIGH; a marker line is never written directly after a line that ends in a backslash continuation; origin: new, not in the brief
  - test: jest placement.spec: mark the second line of a backslash-continued shell command, assert the marker line above the first line of the command
  - test-tags: UNIT
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-192` **The shebang line stays first** - HIGH; no marker line is written above a shebang line; origin: new, not in the brief
  - test: jest placement.spec: mark line 1 of a script with a shebang, assert line 1 is still the shebang
  - test-tags: UNIT
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-193` **Toggle comment leaves markers alone** - HIGH; the editor's toggle-comment command on a selection that holds a marker leaves every marker line a comment line; origin: new, not in the brief
  - test: Galata marks-typing.spec: select the lines around a marked line, press Ctrl /, assert both marker lines unchanged; press again, assert the code as before
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:13Z @kj added
- [ ] `ACC-SAFE-194` **A file kind without comments takes no mark** - HIGH; a file whose language declares no comment syntax, such as JSON, CSV or plain text, takes no mark and is never changed by marking; origin: plan
  - test: Galata marker-safety.spec: select text in a.json, run the mark command, assert the file byte for byte as before and that it still parses
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-SAFE-195` **The menu entry says why** - HIGH; in a file kind without comment syntax the Mark entry is shown disabled, and its label gives the reason
  - test: Galata marker-safety.spec: right-click a selection in a.json, assert a disabled entry whose label names the missing comment syntax
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-SAFE-196` **A refused mark says why** - HIGH; a mark refused for its place writes nothing and shows a notification that names the reason
  - test: Galata marker-safety.spec: select text that could only be marked inside a here-document, press Control Shift M, assert the notification and an unchanged document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added

## Marks while the text changes `TRACK`

Release 3. A mark stays on its text while the user types and while the file changes on disk

- [ ] `ACC-TRACK-197` **Typing before a mark** - CRITICAL; text typed before a mark, on its line or above it, leaves the mark on the same characters
  - test: Galata marks-typing.spec: mark a word, type at line 1 and at the start of the word's line, assert the same word painted
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-198` **Typing after a mark** - CRITICAL; text typed after a mark leaves the mark on the same characters
  - test: Galata marks-typing.spec: mark a word, type directly after it and on the next line, assert the same word painted and the typed text unpainted
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-199` **Typing inside a mark** - CRITICAL; text typed inside marked text becomes part of the marked text
  - test: Galata marks-typing.spec: mark two words, type between them, assert the paint covers both words and the typed text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-200` **The stored mark equals the painted mark** - CRITICAL; after any edit, the mark read back from the document's text covers the same characters as the paint; origin: new, not in the brief
  - test: Galata marks-typing.spec: after each typing case save, parse the file, assert the parsed range equals the painted range
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-201` **Undo and redo** - HIGH; a mark stays on its text through undo and redo of edits before, after and inside it
  - test: Galata marks-typing.spec: type in the three places, undo each, redo each, assert the painted range after every step
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-202` **Cut and paste moves a mark** - HIGH; marked text that is cut and pasted elsewhere carries its mark: one mark, on the pasted text
  - test: Galata marks-typing.spec: cut a marked line, paste it 10 lines down, assert one mark with the same identifier on the pasted text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-203` **A copy makes no second mark with the same id** - CRITICAL; pasting a copy of marked text never leaves two marks with one identifier: every identifier still occurs exactly twice in the document
  - test: Galata marks-typing.spec: copy a marked line with its marker, paste it below, assert each identifier occurs twice
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-204` **A disk change elsewhere keeps the mark** - HIGH; a disk change outside the marked text leaves the mark on its text
  - test: Galata marks-typing.spec: mark a word on line 20, insert 3 lines at line 1 on disk, assert the same word painted
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-205` **A disk change inside the mark keeps it** - HIGH; a disk change that rewrites part of the marked text and leaves both markers keeps the mark around the new text
  - test: Galata marks-typing.spec: mark lines 3 to 5, rewrite line 4 on disk, assert the mark over lines 3 to 5
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-206` **Broken marks are removed** - HIGH; a mark is broken when a rewrite removed one marker, both markers, or all the text between them; a broken mark is not listed and not painted, and its leftover marker line is deleted
  - test: Galata marks-typing.spec: delete a closing marker line on disk, assert no row, no paint and no opening marker in the document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:14Z @kj added
- [ ] `ACC-TRACK-207` **An identifier names one mark** - HIGH; where the file holds two opening markers with one identifier the first in the file is the mark, and its closing marker is the first one after it
  - test: jest marks.spec: parse a text with a duplicated opening marker, assert one mark, from the first pair
  - test-tags: UNIT
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-TRACK-208` **Moving a line moves its mark** - MEDIUM; moving a marked line with the editor's move-line command keeps the mark on that line; origin: new, not in the brief
  - test: Galata marks-typing.spec: mark a line, run the editor's move line down command twice, assert the mark on the moved line
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-TRACK-209` **Edge: mark whose range no longer fits** - MEDIUM; a mark whose stored column range lies outside its line is listed with the word unanchored and painted nowhere; origin: new, not in the brief
  - test: jest marks.spec: parse a marker whose range exceeds the line length, assert the unanchored state
  - test-tags: UNIT
  - log: 2026-10-12T13:24:15Z @kj added

## Notes panel `PANEL`

Release 3. The notes panel beside the editor, with the functions of the Markdown viewer's panel

- [ ] `ACC-PANEL-210` **The panel stands beside the editor** - HIGH; the notes panel is a narrow strip right of the editor, with no overlap; the editor keeps the remaining width
  - test: Galata panel.spec: assert the panel box right of the editor box, narrower, with no overlap
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-211` **Three panel states** - HIGH; the panel is expanded, a minimap of ticks, or hidden, set from its header and from the context menu; while hidden a badge on the editor opens it
  - test: Galata panel.spec: cycle the three states, assert rows, then ticks, then nothing and the badge
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-212` **Opening state** - MEDIUM; a file with marks opens with the panel listing them, a file with none opens with the panel hidden, and the first mark opens it
  - test: Galata panel.spec: open a marked and an unmarked fixture, assert rows and no panel; mark the unmarked one, assert the panel
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-213` **A row shows the passage and the thread** - HIGH; a row shows the colour swatch and the marked text; opened, it shows every note with its author and a 24-hour stamp, the first the comment and the rest replies
  - test: Galata panel.spec: open the row of a two-note fixture, assert both entries in order
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-214` **Comment and Reply** - HIGH; Comment on a mark without notes and Reply on a mark with notes open the note field; Save or Shift Enter writes a note line signed with the handle
  - test: Galata panel.spec: reply with Shift Enter, assert the new comment line in the document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-215` **Edit a note** - MEDIUM; each note has an edit icon; saving the edit rewrites the note's text and keeps its author and stamp
  - test: Galata panel.spec: edit one note, assert the new text with the old author and stamp in the document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-216` **Delete a note** - MEDIUM; each note has an x that removes its comment line; deleting the last note leaves the mark
  - test: Galata panel.spec: delete the only note of a mark, assert no note line and both markers present
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-217` **Delete a mark** - HIGH; the trash on a row removes both markers and their note lines and leaves the code as it was
  - test: Galata panel.spec: remove a mark, assert the file equals the unmarked original
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-218` **Recolour** - MEDIUM; the swatch of a row lists the other five colours; choosing one rewrites the colour attribute and nothing else
  - test: Galata panel.spec: recolour a mark to green, assert colour=green and the rest of the marker unchanged
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-219` **Close and reopen a mark** - MEDIUM; the eye on a row closes a mark with status=closed: it is neither painted nor listed until it is shown again; the eye reopens it
  - test: Galata panel.spec: close a mark, assert status=closed, no row and no paint; show hidden, reopen, assert the row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-220` **Show hidden** - MEDIUM; while a mark is closed the header shows Show hidden with the count of closed marks; pressed, it lists them and paints them muted
  - test: Galata panel.spec: close two marks, assert Show hidden (2); press it, assert two rows
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:15Z @kj added
- [ ] `ACC-PANEL-221` **A note on the whole document** - MEDIUM; the plus in the panel header opens a note on the whole file; leaving it empty removes the marker it wrote
  - test: Galata panel.spec: press plus and cancel, assert no document marker; press plus and save a note, assert it in the file
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-222` **The author handle is asked once** - MEDIUM; the first note written while the setting author is empty asks for a handle, with Save and Skip; Set note handle in the palette asks again; an empty handle signs as @user
  - test: Galata panel.spec: clear author, save a note, answer kj, assert @kj in the document
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-223` **A row reveals its passage** - HIGH; a click on a row scrolls the editor so the marked text is in view and flashes it
  - test: Galata panel.spec: scroll the editor to the top, click the row of a mark far down, assert the marked text in view
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-224` **An agent's reply shows in the thread** - HIGH; a note line another program adds to a marker in the file shows under the earlier notes in the open row, with its author and time, without a reload
  - test: Galata panel.spec: append a line @claude <stamp>: text to a marker on disk, assert the entry in the open row within 2 s
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-225` **The panel never takes the focus from the editor** - HIGH; a panel update caused by a disk change leaves the keyboard focus and the cursor in the editor; origin: proposed in the brief, user has not answered
  - test: Galata panel.spec: type in the editor while a reply is appended on disk, assert the focus in the editor and the typed text in order
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-226` **A draft survives a panel update** - MEDIUM; text typed into an open note field stays, with the focus in the field, when a disk change updates the panel
  - test: Galata panel.spec: type a draft, append a reply to another mark on disk, assert the draft text and the focused field
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-227` **Copy mark ID** - LOW; a row's context menu holds Copy mark ID, which copies the mark's identifier
  - test: Galata panel.spec: right-click a row, choose Copy mark ID, assert the clipboard
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-228` **Panel roles for a screen reader** - LOW; the notes list has the list role, and each row the listitem role, with aria-current on the selected row
  - test: Galata panel.spec: assert the two roles and aria-current on the selected row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-PANEL-229` **The notes code is kept apart** - MEDIUM; the modules copied from the two viewers import nothing from the editor and notebook modules of this extension, so a shared package can be taken out later; origin: plan
  - test: jest structure.spec: read the imports of every notes module, assert none resolves to an editor or notebook module
  - test-tags: UNIT
  - log: 2026-10-12T13:24:16Z @kj added

## Server write route `WRITE`

Release 3. The route that writes a marker into a file without overwriting another program's change

- [ ] `ACC-WRITE-230` **Compare-and-write** - CRITICAL; POST write with path, expected hash and edits makes the edits in the file only while the file's hash equals the expected one, and answers 200 with the new contents model
  - test: pytest test_routes.py: post a matching hash and one edit, assert 200 and the edited file
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-WRITE-231` **A changed file is refused** - HIGH; a hash that does not match answers 409 with the current hash and leaves the file as it was
  - test: pytest test_routes.py: post a stale hash, assert 409 and an unchanged file
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-WRITE-232` **The request holds edits, not the file** - HIGH; a marker write sends its edits alone, each with start, end and text; the file's text is not in the request
  - test: jest notes.spec: write a mark on a clean 2 MB document, assert a request body under 4 kB
  - test-tags: UNIT
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-WRITE-233` **The route keeps the line ending** - MEDIUM; the server makes the edits in the file's text and keeps the file's line ending
  - test: pytest test_routes.py: post an edit to a CRLF file, assert every line break is still CRLF
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:16Z @kj added
- [ ] `ACC-WRITE-234` **Bad requests** - MEDIUM; a body without path, expected and edits answers 400, edits out of range or overlapping answer 400, and a missing file answers 404
  - test: pytest test_routes.py: post each bad body, assert its code
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:16Z @kj added

## Agent skill `AGENT`

Release 3. The agent skill that teaches an AI assistant the markers of source files

- [ ] `ACC-AGENT-235` **The skill is in the repository** - HIGH; the skill is .agents/skills/jupyterlab-advanced-code-viewer-extension/SKILL.md, with that name in its name field
  - test: pytest test_skill.py: read the front matter, assert the name equals the directory name
  - test-tags: UNIT
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-236` **pip install ships the skill** - HIGH; the wheel puts SKILL.md and its scripts under share/jupyter/agents/skills/jupyterlab-advanced-code-viewer-extension of the Python environment, outside the Python package
  - test: pytest test_skill.py: compare the files under sys.prefix with the repository copies
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-237` **README gives the two link lines** - MEDIUM; the README says where the skill is and gives the link line for an installed lab and the one for a clone
  - test: manual: read the Agent skill section of README.md, run both lines in a scratch home, assert both links resolve
  - test-tags: MANUAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-238` **The skill gives the marker form per language** - HIGH; the skill shows the marker form for line-comment languages, block-comment languages and HTML-comment files, and every example reads back as the mark it describes
  - test: jest skill.spec: parse every fenced example of SKILL.md, assert identifier, colour, status and notes as the text beside it says
  - test-tags: UNIT
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-239` **The skill says where markers may go** - HIGH; the skill states that a marker never goes inside a multi-line string, a here-document or a template literal, and each of its placement examples runs as the unmarked file does
  - test: pytest test_skill.py: run or parse each placement example with and without its markers, assert equal results
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-240` **Answering and closing** - MEDIUM; the skill tells how to answer a comment, by one added note line, and how to close a mark; an answer written that way shows in the panel thread
  - test: Galata skill.spec: write the skill's answer example into a marked file on disk, assert the reply in the open row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-241` **watch-marks.py reports new comments in source files** - HIGH; scripts/watch-marks.py prints one line for each comment line the user adds in a watched source file, and none for the assistant's own lines, closed marks or colour changes
  - test: pytest test_watch_marks.py: add a user line and an assistant line, close a mark and recolour one, assert one event
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-AGENT-242` **One grammar across the three extensions** - MEDIUM; a mark written by the Markdown viewer's skill in a .md file reads in this extension with the same identifier, colour, status and notes; origin: plan
  - test: jest marks.spec: parse the mark examples of the Markdown viewer's SKILL.md, copied into fixtures, assert the fields
  - test-tags: UNIT
  - log: 2026-10-12T13:24:17Z @kj added

## Marks in notebook cells `NBMARK`

Release 4. Marks and comments in the Markdown cells and code cells of a notebook

- [ ] `ACC-NBMARK-243` **Markdown cell marks are the Markdown viewer's HTML comments** - CRITICAL; a mark in a Markdown cell is stored in the cell source as the Markdown viewer's HTML comment pair, in its exact form; origin: plan
  - test: Galata marks-notebook.spec: mark a word of a rendered Markdown cell, read the cell source, assert the two HTML comments as the Markdown viewer writes them
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-244` **Painted in the rendered Markdown cell** - CRITICAL; a mark of a Markdown cell paints its text in the rendered cell, and the markers are not shown
  - test: Galata marks-notebook.spec: render a marked Markdown cell, assert the paint on the marked words and no visible comment text
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-245` **Painted in the Markdown cell's editor** - CRITICAL; the same mark paints its text in the unrendered cell's editor, with one compact marker
  - test: Galata marks-notebook.spec: enter the marked Markdown cell, assert the paint and one marker widget in its editor
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-246` **Marker places follow the Markdown viewer's rules** - HIGH; in a Markdown cell markers go where the Markdown viewer puts them, so the cell renders the same with and without them
  - test: jest placement.spec: place marks in a list item, in a table row and above a code fence, assert the Markdown viewer's places and equal rendered text with and without markers
  - test-tags: UNIT
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-247` **Code cell marks are comment lines of the kernel's language** - CRITICAL; a mark in a code cell is stored as comment lines in the language the notebook's metadata names, by the rules of a source file; origin: plan
  - test: Galata marks-notebook.spec: mark a word in a code cell of a Python notebook, assert # marker lines in the cell source
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-248` **Code cell marks behave as in a source file** - HIGH; in a code cell a mark is painted, shows one compact marker, obeys the raw-lines setting and stays on its text while the user types
  - test: Galata marks-notebook.spec: repeat the paint, compact marker, raw-lines and typing-before cases in a code cell
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:17Z @kj added
- [ ] `ACC-NBMARK-249` **A marked notebook executes the same** - CRITICAL; a notebook with marks in its code cells gives the same outputs under nbconvert --execute as the notebook without them
  - test: Galata marks-notebook.spec: mark through the notebook, execute a copy and the original with nbconvert, assert equal outputs
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-250` **No marker line above a cell magic** - CRITICAL; a marker line is never written above a line that starts with %%, so a cell magic stays on the first line of its cell; origin: new, not in the brief
  - test: jest placement.spec: mark line 1 and line 2 of a %%time cell, assert line 1 is still %%time
  - test-tags: UNIT
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-251` **A cell whose body is data takes no mark** - HIGH; a cell whose first line is a cell magic that takes the body as data, such as %%writefile or %%html, takes no mark, and the menu entry says why; origin: new, not in the brief
  - test: Galata marks-notebook.spec: select text in a %%writefile cell, assert a disabled Mark entry with the reason and an unchanged source
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-252` **A raw cell takes no mark** - MEDIUM; a raw cell takes no mark, and the menu entry says why; origin: new, not in the brief
  - test: Galata marks-notebook.spec: select text in a raw cell, assert a disabled Mark entry with the reason
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-253` **A mark survives a cell split** - HIGH; after a cell is split outside a mark, the mark is listed and painted on its text in the cell that holds it
  - test: Galata marks-notebook.spec: mark line 1, split the cell at line 3, assert the mark in the first cell
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-254` **Edge: split inside marked text** - HIGH; a cell split inside marked text never leaves one marker in each cell: both markers of an identifier are in one cell, or the mark is removed; origin: new, not in the brief
  - test: Galata marks-notebook.spec: mark lines 1 to 4, split at line 2, assert each identifier occurs twice in one cell or not at all
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-255` **A mark survives a cell merge** - HIGH; after two cells are merged, each mark of both is listed and painted on its text
  - test: Galata marks-notebook.spec: mark a word in each of two cells, merge them, assert two marks on their words
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-256` **A mark survives a cell move** - HIGH; after a cell is moved, by keys or by dragging, its marks are listed under it and painted on their text
  - test: Galata marks-notebook.spec: mark a word, move the cell down twice, assert the mark and its row under the moved cell
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-257` **A copied cell makes no second mark with the same id** - CRITICAL; pasting a copy of a marked cell never leaves two marks with one identifier in the notebook
  - test: Galata marks-notebook.spec: copy and paste a marked cell, assert each identifier occurs twice in the notebook
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-258` **A deleted cell takes its marks** - MEDIUM; the marks of a deleted cell leave the panel, and return when the deletion is undone; origin: new, not in the brief
  - test: Galata marks-notebook.spec: delete a marked cell, assert no row; press Z, assert the row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-259` **Marks show in command mode and edit mode** - HIGH; marks are painted and the panel works while the notebook is in command mode and while it is in edit mode; origin: user
  - test: Galata marks-notebook.spec: assert paint and rows in each mode; reply from the panel in each
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-260` **The panel groups notes by cell** - HIGH; in a notebook the panel lists the notes under the cell they belong to, in the order of the cells
  - test: Galata marks-notebook.spec: mark in cells 2 and 5, assert two groups in cell order with one row each
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-261` **A row scrolls to the cell and reveals the passage** - HIGH; a click on a row scrolls the notebook to the row's cell and reveals the marked text, also when that cell was outside the rendered window
  - test: Galata marks-notebook.spec: in a 200-cell notebook scrolled to the top click the row of a mark in cell 180, assert the marked text in view
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-262` **A notebook note reaches the file by the same rule** - CRITICAL; in a notebook without other unsaved edits a mark or note is in the file within 2 s with no File Changed dialog; with unsaved edits it waits for the next save
  - test: Galata marks-notebook.spec: mark in a clean notebook, poll the file; type in a cell, mark again, assert the file unchanged until Ctrl S
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:18Z @kj added
- [ ] `ACC-NBMARK-263` **An agent's reply in a cell shows in the thread** - HIGH; a note line another program adds to a marker in a cell source on disk shows in the open row, and the cell keeps its widget
  - test: Galata marks-notebook.spec: append a reply to a marker in the file, assert the entry in the row and the cell's tagged node still attached
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-NBMARK-264` **The skill covers notebooks** - HIGH; the skill gives the marker form for a Markdown cell, a code cell, an output note and a notebook note, and every example reads back as the mark it describes
  - test: jest skill.spec: parse the notebook examples of SKILL.md, assert the fields the text beside each names
  - test-tags: UNIT
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-NBMARK-265` **watch-marks.py reports new comments in notebooks** - HIGH; scripts/watch-marks.py reports a user comment line added in a cell source, in cell metadata and in notebook metadata of a watched notebook, once each
  - test: pytest test_watch_marks.py: add a user line in each of the three places, assert three events
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:19Z @kj added

## Notes kept in metadata `META`

Release 4. Notes on stored outputs, kept in cell metadata, and the note on the whole notebook, kept in notebook metadata

- [ ] `ACC-META-266` **Stored output text takes a comment** - CRITICAL; a selection in a stored stream, text/plain, text/html or text/markdown output is offered the Mark submenu and Add Comment; origin: plan
  - test: Galata output-notes.spec: select text in each of the four output kinds, assert both entries visible and enabled
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-267` **A picture takes a comment as a whole** - HIGH; a stored picture output takes a mark on the whole picture
  - test: Galata output-notes.spec: right-click an image/png output, mark it, assert a note stored for the whole output
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-268` **An output note is stored in cell metadata** - CRITICAL; a note on an output is stored in the cell's metadata with the quoted text and the cell's execution count; the cell source and the outputs are unchanged; origin: plan
  - test: Galata output-notes.spec: mark output text, read the cell, assert the note in metadata with quote and count, and source and outputs as before
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-269` **An output note is painted on the output** - HIGH; the quoted text of an output note is painted in the output, and the stored output is not changed
  - test: Galata output-notes.spec: mark output text, assert the paint on it and the stored output as before
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-270` **A note is flagged when the cell ran again** - HIGH; when the cell's execution count differs from the one stored with the note, the panel row is flagged as from an earlier run, and the note is kept; origin: plan
  - test: Galata output-notes.spec: mark output text, run the cell again, assert the flag on the row and the note still stored
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-271` **Edge: quoted text gone from the output** - MEDIUM; a note whose quoted text the output no longer holds is listed with the word unanchored and painted nowhere; origin: new, not in the brief
  - test: Galata output-notes.spec: replace the output on disk with other text, assert the unanchored row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-272` **Drawn output takes no comment** - CRITICAL; output that a script or a widget draws takes no comment: the context menu shows neither the Mark submenu nor Add Comment there; origin: user, the HTML viewer's rule
  - test: Galata output-notes.spec: select text an output's script added and text inside a widget view, assert both entries hidden
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-273` **Keyboard marking of drawn output says why** - MEDIUM; Accel Shift M on a selection in drawn output writes nothing and shows a notification that only text stored in the file takes a comment
  - test: Galata output-notes.spec: select script-added output text, press Control Shift M, assert the notification and unchanged metadata
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-274` **An output note survives nbconvert** - HIGH; after nbconvert --execute --inplace on the file, a note on an output is still listed, flagged as from an earlier run; origin: new, not in the brief
  - test: Galata output-notes.spec: mark output text, run nbconvert on the file, assert the row with its flag
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-275` **An agent answers an output note** - HIGH; a reply another program adds to a note in the cell metadata on disk shows in the open row
  - test: Galata output-notes.spec: append a reply to the metadata note in the file, assert the entry in the row
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:19Z @kj added
- [ ] `ACC-META-276` **The note on the whole notebook** - MEDIUM; the plus in the panel header writes a note on the whole notebook into the notebook's metadata; no cell source changes
  - test: Galata output-notes.spec: press plus, save a note, read the file, assert the note in notebook metadata and equal cell sources
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:20Z @kj added
- [ ] `ACC-META-277` **A script lists every note of a notebook** - HIGH; a script bundled with the skill lists every note of a notebook: the marks in cell sources, the output notes in cell metadata and the note in notebook metadata
  - test: pytest test_list_notes.py: run the script on a fixture with one note of each of the three kinds, assert three notes with cell index, quote and thread
  - test-tags: INTEGRATION
  - log: 2026-10-12T13:24:20Z @kj added
- [ ] `ACC-META-278` **A copied cell's output notes get no shared id** - MEDIUM; pasting a copy of a cell that carries output notes never leaves two notes with one identifier in the notebook; origin: new, not in the brief
  - test: Galata output-notes.spec: copy and paste a cell with an output note, assert every note identifier is unique
  - test-tags: FUNCTIONAL
  - log: 2026-10-12T13:24:20Z @kj added

