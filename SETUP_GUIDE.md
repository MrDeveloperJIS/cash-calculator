# Cash Calculator — Setup Guide (Windows 10/11)

A from-scratch walkthrough for building the app yourself, even if you've
never installed a dev tool before. You'll install two things — **Node.js**
and **Rust** — then build the app.

Total extra download while building: about 500MB. The final installer you
share with users is roughly **3–8 MB** (see the main [README](./README.md)
for what the app does).

---

## Step 1 — Install Node.js

1. Go to https://nodejs.org and download the **LTS** version.
2. Run the installer, keep clicking Next with the default options.
3. Close and reopen any terminal window, then check it worked:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.

---

## Step 2 — Install Rust

1. Go to https://rustup.rs
2. Download `rustup-init.exe` and run it.
3. A terminal window opens. Press `1` then Enter (default installation).
   No admin rights are required — it installs into your user folder.
4. Close and reopen any terminal window so it picks up the new PATH.
5. If the installer says you also need "Microsoft C++ Build Tools",
   follow the link it gives you and install that too — it's required on
   Windows to compile Rust code.

Check it worked:
```
rustc --version
```
You should see a version number.

---

## Step 3 — Get a code editor (optional but recommended)

Any editor works, but [VS Code](https://code.visualstudio.com) is free and
popular. Download it, install with defaults, and open the project folder
from it later (File → Open Folder).

---

## Step 4 — Get the project

Download or clone the repo, then unzip it if needed — anywhere is fine,
e.g. `C:\Projects\cash-calculator`.

```
git clone https://github.com/mrdeveloperjis/cash-calculator.git
```

Open a terminal in that folder (in VS Code: Terminal → New Terminal).

---

## Step 5 — Install dependencies

```
npm install
```
This downloads the Tauri CLI — not a framework, just the tool that builds
the native shell around the app.

---

## Step 6 — Run it live (to test)

```
npm run tauri dev
```
The first run takes a few minutes (Rust compiles everything once). A
window pops up with the app — try entering note counts and switching
currency in Settings; the total and words should update instantly. Close
the window when you're done testing.

---

## Step 7 — Build the installable .exe

```
npm run tauri build
```
When it finishes, find your installer here:
```
src-tauri\target\release\bundle\nsis\Cash Calculator_x.x.x_x64-setup.exe
```
(there's also an `.msi` in the `msi` folder — either works). That file is
the one you share with users, around 3–8 MB.

---

## Customizing the app

See the **Customization** section in the [README](./README.md#customization)
for what to edit and where. Settings (theme, currency, denominations) save
automatically to the app's local storage — nothing extra to set up.

---

## If something goes wrong

- `npm run tauri dev` fails immediately mentioning "link.exe" or "MSVC" →
  you need Microsoft C++ Build Tools (Step 2, last bullet).
- First build is slow (5–10 min) — that's normal, Rust is compiling.
  Later builds are much faster.
- `node`/`npm`/`rustc` not recognized → close and reopen your terminal
  (or reboot) so the new PATH takes effect.