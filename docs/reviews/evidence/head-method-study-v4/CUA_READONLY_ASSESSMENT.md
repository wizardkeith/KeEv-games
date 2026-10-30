# Existing Windows CUA — documentation assessment, not a GUI test

Read on 2026-10-30: installed Computer Use skill 26.1027.30824, full guidance,
window2 API and confirmations documentation. The first assessment was read-only.
The parent subsequently confirmed Wix stopped and explicitly released GUI
ownership for a bounded Blender test. No Blender window was ultimately captured
or given input, because the permitted launch was blocked by app approval timeout.

## Documented capabilities

- The existing `@oai/sky` client supports returned app/window inventory and
  selection, window-specific screenshots/accessibility, clicks, keyboard chords,
  scrolling and coordinate drag strokes. The docs explicitly suggest canvas
  drag for drawing or 3D viewport manipulation.
- Windows.Graphics.Capture is documented to capture an occluded window; capture
  can be restricted to the selected window. Accessibility can be requested
  without a screenshot. This avoids requiring a whole-desktop screenshot.
- A coordinate drag is documented as one start and one end position. A click
  can select left/right/middle buttons. Keyboard input includes numpad aliases,
  which may allow Blender view shortcuts after actual focus/binding verification.
- Input methods activate their target window automatically. Window selection
  is **not isolated monitor ownership or a separate desktop/input seat**. The
  Windows mouse/focus/keyboard can interfere with the human or Wix even when
  observation is restricted to a Blender window.

## Still untested

- The visible CUA REPL was initialized after GUI release. Its returned Windows
  documentation supplies the supported `cua` window wrapper backed by Sky;
  read-only `listApps` worked and returned Blender 5.2, not running/no windows.
  Windows `getApp` requires a returned window ID, not the app-name string used
  on macOS. No guessed window handle or direct helper protocol was used.
- A disposable study copy and before-vertex baseline were prepared through
  background Blender. The one permitted `cua.computer.launch_app` call with the
  exact returned launcher app ID reported `Computer Use app approval timed out`.
  A read-only inventory then again showed not running/no windows. The operation
  was not retried or replaced with a shell launch. See `GUI_CAPABILITY_TEST.json`.
- No Blender viewport screenshot, UI accessibility tree, brush selection,
  sculpt stroke, vertex paint, texture paint, tablet pressure or mesh/paint
  delta has been verified. Blender's canvas may expose little semantic UIA;
  image-based coordinates may be needed.
- The documented drag schema has no pressure curve, multi-point path, duration
  or tablet-tilt arguments. Precise freehand/pressure-sensitive sculpting is not
  established. The `drag` schema also does not document a middle-button option;
  Blender orbit/pan gestures cannot be assumed just because click supports it.
- The prior headless Blender probe entered SCULPT mode but brush-stroke poll
  returned false with `bpy.context.area == None`. This is a limitation of that
  background operator context, not proof that the GUI brush cannot work.

## Necessary bounded verification after GUI release

Use only the supported runtime entry. Select exactly one returned, task-owned
Blender window, observe its own state, and work on a disposable copy of the
study rather than a user's existing project. Verify viewport focus and edit
mode before one reversible stroke. A saved mesh-coordinate or painted-pixel
delta plus the window's visible result is needed to prove actual sculpt/paint
operation; entering a mode or clicking a toolbar alone is insufficient. Undo
or keep a task-owned test file; do not delete user data. Stop if a lock screen,
login, permission/security prompt, wrong window or uncertain input outcome appears.

The runtime inventory works; app access/launch approval remains blocked and no
actual Blender UI stroke or save is established. No new Blender plugin,
credentials or installation is demonstrated as necessary. Successful basic GUI
input would still not prove the ability to
produce the approved style; organic sculpting, fitted topology and painting
remain unresolved authoring-quality requirements.
