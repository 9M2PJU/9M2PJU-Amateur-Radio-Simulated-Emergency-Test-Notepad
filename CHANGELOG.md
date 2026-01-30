# Changelog

All notable changes to the **9M2PJU SET Pad (DARES)** will be documented in this file.

## [5.0.0] - 2026-01-30
### 🚀 MAJOR: Cloud Architecture Upgrade (Supabase)
- **Cloud Database**: Fully migrated from LocalStorage to **Supabase** (PostgreSQL). Messages, Logs, and Settings now sync across devices.
- **Authentication**: Added secure **Email/Password Registration** and **Login**.
- **User Profiles**: Custom profiles (`callsign`, `grid`) are now stored in the cloud.

### 🛡️ Admin & Control
- **Super Admin Dashboard**: New restricted area for `9m2pju@hamradio.my`.
- **Impersonation**: Admins can "ghost" into other user accounts to debug issues or view tactical data.
- **Access Control**: Strict Row-Level Security (RLS) policies implemented. The users see only their data; Admins see all.

### 🎨 Branding & UI (DARES)
- **Official Identity**: Replaced generic icons with the official **DARES Logo**.
- **Tactical Login**: Redesigned Auth pages with "Digital Amateur Radio Emergency Suite" branding.
- **Security UX**: Added **Password Confirmation** field to registration for enhanced security.

---

## [1.3.2] - 2026-01-30
### 🎨 Theme Fixes (Mission Critical)
- **High-Contrast Desert Mode**: Complete redesign of the light theme to resolve invisible text issues.
- **Dynamic Text Variables**: Integrated `--color-text` tokens across all components.

## [1.3.1] - 2026-01-30
### 🎨 Theme Refinement
- **Desert Mode**: Replaced vibrant orange text with high-contrast Coyote Brown and Obsidian.

## [1.3.0] - 2026-01-30
### 📡 Signal & Crypto Refinement
- **Morse Tool (CW)**: Separated into a dedicated standalone tool.
- **Cipher Suite**: Added Caesar, Atbash, Substitution, Playfair, and Transposition ciphers.

### 📧 Messaging Enhancements
- **Direct Email Integration**: Replaced general Web Share with direct Email button.
- **Auto-Formatting**: Populates email subject/body with IARU data.

### 🛠️ Technical Fixes
- **Build Optimization**: Resolved Tailwind CSS opacity variable issues.

---
73 de 9M2PJU
