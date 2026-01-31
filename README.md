# 🌊 9M2PJU SET Pad (DARES)
### DIGITAL AMATEUR RADIO EMERGENCY SUITE

<div align="center">

  <a href="https://github.com/9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/releases">
    <img src="https://img.shields.io/github/v/release/9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad?style=for-the-badge&color=06b6d4" alt="Release">
  </a>
  
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad?style=for-the-badge&color=f59e0b" alt="License">
  </a>
  
  <a href="https://github.com/9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/issues">
    <img src="https://img.shields.io/github/issues/9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad?style=for-the-badge&color=ef4444" alt="Issues">
  </a>
  
  ![Status](https://img.shields.io/badge/status-stable-success.svg?style=for-the-badge)
  ![Platform](https://img.shields.io/badge/platform-web%20%7C%20pwa-orange.svg?style=for-the-badge)

</div>

<p align="center">
  <img src="public/screenshot-preview.png" width="100%" alt="9M2PJU SET Pad Interface" style="border-radius: 10px; border: 1px solid #06b6d4;">
</p>

> **The Ultimate Tactical Suite for Mission-Critical Emergency Communications.**  
> *Engineered for speed, precision, and uncompromised field performance.*

---

## 🌟 Star History

<a href="https://star-history.com/#9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=9m2pju/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad&type=Date" />
 </picture>
---

## 📋 Table of Contents
- [Mission Capabilities](#-mission-capabilities-dares)
- [System Architecture](#-system-architecture)
- [Field Usage Protocols](#-field-usage-protocols)
- [Technical Superiority](#-technical-superiority)
- [Authorization](#-authorization)
- [Support the Mission](#-support-the-mission)

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Operator]) -->|Auth & Logs| Client[Web Client / PWA]
    Client -->|Sync Data| Supabase[Supabase Cloud]
    Client -->|Local Storage| OfflineDB[(LocalDB)]
    
    subgraph Core Modules
        Client --> Logger[Tactical Logger]
        Client --> Radiogram[IARU Msg Generator]
        Client --> Cipher[Cipher Suite]
        Client --> Admin[Admin Dashboard]
    end

    subgraph External
        Supabase -->|Auth| AuthProvider[Email/Password]
        Supabase -->|Database| PG[PostgreSQL]
    end

    Logger -->|Export| PDF[PDF / ADIF]
    Radiogram -->|Transmit| Email[Email Relay]
```

---

## 💎 Mission Capabilities (DARES)

**We do not just log contacts. We manage chaos.**

| Module | Purpose | Tactical Advantage |
| :--- | :--- | :--- |
| **CLOUD SYNC** | Seamless real-time data persistence across devices. | ☁️ Always On |
| **LOGGER** | Rapid-fire contact entry with auto-time/date stamping. | ⚡ Zero Latency |
| **RADIOGRAM** | Standards-compliant IARU message generation engine. | 📄 Formal Traffic |
| **CIPHER** | Military-grade field encryption (Playfair, Transposition). | 🔐 Secure Comms |
| **ADMIN** | Advanced user management and station impersonation. | 👁️ Overwatch |
| **CW DECODER** | Integrated Morse tools for signal verification. | 📡 Signal Intel |

---

## 🛠️ Field Usage Protocols

### 1. ESTABLISH IDENTITY
Authenticate securely to access your command center. Your **Callsign** and **Grid Square** are automatically synchronized to the cloud, stamping every tactical action with your unique operator ID.

### 2. TRAFFIC HANDLING
Draft, Validate, and Transmit formal **IARU Radiograms**. 
- **Auto-Formatting**: We handle the preamble structure; you focus on the message.
- **Direct Dispatch**: One-click PDF generation or email relay for rapid dissemination.

### 3. TACTICAL LOGGING
The **Logger** is built for high-stress environments.
- **Keyboard-First**: Keep hands on the keys.
- **Editable Entries**: Fix mistakes on the fly without deleting and re-logging. 
- **Night Ops**: High-contrast "Neon" aesthetics ensure visibility in zero-light conditions without compromising night vision.
- **Live Sync**: Log entries are instantly backed up. Never lose a contact.

### 4. SECURE COMMS
When voice channels are compromised or privacy is paramount, utilize the **Cipher Suite**.
- **Playfair & Transposition**: Classical field ciphers compliant with emergency protocols.
- **Verification**: Instant encrypt/decrypt toggle for message integrity checks.

---

## 📦 Technical Superiority

- **Architecture**: Modern React engine for blisteringly fast UI response.
- **Reliability**: PWA-ready for installation on field rugged tablets and laptops.
- **Security**: Row-Level Security (RLS) ensures your mission data is yours alone.
- **Design System**: **Orbitron** typography and **Tailwind** styling for a futuristic, command-deck interface.

---

## 📜 Authorization

Authorized for use under the **MIT License**.

---

## ☕ Support the Mission

If this tool helps you in the field, consider fueling the development.

<div align="center">
  <a href="https://www.buymeacoffee.com/9m2pju" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;">
  </a>
  <br/>
  <br/>
  <p>Or scan via DuitNow / TNG eWallet</p>
  <img src="public/duitnow-qr.png" width="200" alt="DuitNow QR" style="border-radius: 10px; border: 2px solid #06b6d4;">
</div>

<div align="center">
   <br />
   <img src="public/dares-logo.png" width="64" alt="DARES Logo">
   <br />
   <br />
   <small>DEVELOPED WITH PRECISION BY <a href="https://hamradio.my">9M2PJU</a></small>
</div>

