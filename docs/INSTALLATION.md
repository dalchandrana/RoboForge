# RoboForge Installation & Setup Guide

Welcome to **RoboForge** — the free, open-source, offline-first robotics learning and simulation studio!

---

## 📦 System Requirements

* **macOS:** macOS 11.0+ (Apple Silicon M1/M2/M3/M4 or Intel Core i5+)
* **Windows:** Windows 10 (64-bit) or Windows 11
* **Linux:** Ubuntu 20.04+, Debian 11+, or modern glibc distribution with WebKit2GTK 4.1
* **Disk Space:** ~200 MB for the RoboForge app (plus ~2 GB if downloading local Ollama models)
* **RAM:** 8 GB minimum (16 GB recommended if running local AI models)

---

## 🍎 macOS Installation

### 1. Download
Download the appropriate installer from the [Releases](https://github.com/roboforge/roboforge/releases) page:
* **Apple Silicon (M1/M2/M3/M4):** `RoboForge_<version>_aarch64.dmg`
* **Intel Mac:** `RoboForge_<version>_x64.dmg`

### 2. Install
1. Double-click the downloaded `.dmg` file.
2. Drag the **RoboForge** icon into your **Applications** folder.

### 3. First Launch & Apple Gatekeeper Note
Because RoboForge is an independent open-source project without a paid commercial enterprise signing certificate, macOS Gatekeeper may show a warning on first launch:
> *"RoboForge cannot be opened because Apple cannot check it for malicious software."*

**How to open:**
1. In your **Applications** folder, **Right-click (or Control-click)** on `RoboForge` and select **Open**.
2. Click **Open** in the confirmation dialog. (You only need to do this once).
3. *Alternative:* Go to **System Settings → Privacy & Security**, scroll down to the Security section, and click **Open Anyway**.

---

## 🪟 Windows Installation

### 1. Download
Download the Windows installer from [Releases](https://github.com/roboforge/roboforge/releases):
* **Recommended:** `RoboForge_<version>_x64-setup.exe` (NSIS Installer)
* **Enterprise / MSI:** `RoboForge_<version>_x64_en-US.msi`

### 2. Install
1. Double-click `RoboForge_<version>_x64-setup.exe`.
2. Follow the setup wizard to install RoboForge to your user directory or Program Files.

### 3. Windows SmartScreen Note
Windows SmartScreen may display:
> *"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

**How to open:**
1. Click **More info**.
2. Click **Run anyway**.

---

## 🤖 Optional: Setting up the Local AI Coach (Ollama)

RoboForge includes an intelligent **Socratic AI Coach** that guides you through electronics and code without giving away spoilers. It runs **100% locally and offline on your computer**.

### Do I need this?
* **No:** RoboForge is 100% usable without Ollama! If you choose **AI-Off Mode**, RoboForge uses human-authored hint ladders.
* **Yes:** If you want interactive, dynamic conversational tutoring.

### Quick Setup:
1. Install Ollama from [ollama.com](https://ollama.com) (or run `brew install ollama` on Mac).
2. Open your terminal and pull our default recommended model:
   ```bash
   ollama run llama3.2:3b
   ```
   *(For older laptops with 8 GB RAM, use `ollama run llama3.2:1b` instead).*
3. Open RoboForge — the AI Coach will automatically detect your local model!

---

## 🔒 Verifying File Integrity (Checksums)

To verify that your downloaded installer has not been modified or corrupted:

```bash
# macOS / Linux:
shasum -a 256 RoboForge_<version>_*.dmg

# Windows (PowerShell):
Get-FileHash .\RoboForge_<version>_x64-setup.exe -Algorithm SHA256
```

Compare the output hash with the published values in `SHA256SUMS.txt` on the release page.
