# Installing Unsigned RoboForge Desktop Releases

Because RoboForge is a free, non-profit community project built without expensive proprietary enterprise developer certificates, early release packages may trigger operating system warnings on first launch.

Every official RoboForge binary is built transparently via public GitHub Actions and includes cryptographic SHA-256 checksums in `SHA256SUMS.txt`.

---

## 1. Verifying SHA-256 Checksums (All Platforms)

Before running any downloaded package, you can verify its cryptographic integrity:

### macOS / Linux
```bash
# Verify against published SHA256SUMS.txt
sha256sum -c SHA256SUMS.txt --ignore-missing

# Or calculate checksum manually:
shasum -a 256 RoboForge_*.dmg
```

### Windows (PowerShell)
```powershell
Get-FileHash -Algorithm SHA256 .\RoboForge_*.exe
```
Compare the output against the hash published in `SHA256SUMS.txt` on the GitHub release page.

---

## 2. macOS Installation (Gatekeeper Bypass)

On macOS Sonoma, Sequoia, and newer, opening an unsigned application may display:
> *"RoboForge cannot be opened because Apple cannot check it for malicious software."*

### Standard Method (GUI):
1. Open the downloaded `.dmg` and drag `RoboForge.app` into your `/Applications` folder.
2. In Finder, open `/Applications`.
3. **Right-click (or Control-click)** on `RoboForge.app` and choose **Open**.
4. In the dialog that appears, click the **Open** button.
5. You only need to do this once. Subsequent launches work by clicking the app normally or launching via Spotlight.

### Alternative (Terminal):
If Gatekeeper still blocks the app, remove the quarantine quarantine extended attribute:
```bash
xattr -cr /Applications/RoboForge.app
```

---

## 3. Windows Installation (Microsoft Defender SmartScreen)

When running the installer on Windows 10/11, SmartScreen may display:
> *"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

### Installation Steps:
1. Double-click the installer (`RoboForge_x.x.x_x64-setup.exe` or `.msi`).
2. Click the **More info** link located under the warning message.
3. Click the **Run anyway** button that appears at the bottom right.
4. Complete the standard installer wizard.

---

## 4. Linux Installation (AppImage & Debian)

### AppImage
1. Open a terminal and grant execute permissions:
   ```bash
   chmod +x RoboForge_*.AppImage
   ```
2. Run the AppImage:
   ```bash
   ./RoboForge_*.AppImage
   ```
*(Note: On Ubuntu 22.04+, ensure `libfuse2` is installed: `sudo apt install libfuse2`)*

### Debian / Ubuntu (`.deb`)
1. Install using `apt` or `dpkg`:
   ```bash
   sudo dpkg -i roboforge_*_amd64.deb
   sudo apt-get install -f # Fix any missing desktop dependencies
   ```
2. Launch `roboforge` from your application launcher or terminal.

---

## 5. Security & Privacy Guarantee

RoboForge is strictly offline:
- Zero telemetry, analytics, or remote tracking.
- Zero network calls at runtime outside `http://127.0.0.1:11434` (optional local Ollama LLM).
- Full source code is open and inspectable under the Apache-2.0 license.
