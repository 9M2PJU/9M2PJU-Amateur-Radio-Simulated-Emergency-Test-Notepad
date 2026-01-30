# Changelog

All notable changes to the **9M2PJU SET Pad (DARES)** will be documented in this file.

## [5.2.0] - 2026-01-30
### 📱 Mobile UI Fix (Nuclear Fix)
- **CRITICAL**: Replaced complex flex chains with `min-h-screen` to guarantee content visibility on mobile
- **Layout Simplification**: Removed all `flex-1` classes that were causing height collapse
- **Guaranteed Scrolling**: Content now uses natural document flow with `overflow-y-auto` parent
- **Bottom Clearance**: Applied `pb-32` directly to content wrapper for navigation clearance

## [5.1.0] - 2026-01-30
### 🚀 Features & Enhancements
- **Logger Upgrade**: Added ability to **Edit** existing log entries (date, time, callsign, remarks) directly from the list.
- **Form Typography**: Significantly increased font sizes for "Operator Use" labels (RECVD, DATE, TIME) for better readability.
- **RST Display Fix**: Resolved issue where RST columns displayed placeholders (`/`) instead of values.

### 🛡️ Stability
- **Critical Fix**: Resolved a runtime crash in the Logger module caused by a missing handler function.
- **Documentation**: Verified Cipher Converter logic for mission readiness.

## [5.0.1] - 2026-01-30
### 🔧 Hotfixes & Enhancements
- **Admin Stats**: Added "Outbox" message counts to the Super Admin user list for easy monitoring.
- **Donation Modal**: Implemented a 10-second auto-close timer and QR code integration.
- **Security Fix**: Patched RLS policies to ensure Super Admins can view all user messages during impersonation.
- **Stability**: Fixed a critical build error in the Admin module.

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
