# Changelog

All notable changes to the **9M2PJU SET Pad (DARES)** will be documented in this file.

## [1.3.0] - 2026-01-30

### 📡 Signal & Crypto Refinement
- **Morse Code (CW)**: Separated into a dedicated standalone tool with high-performance audio engine and visual character tracking.
- **Cipher Suite (CIPHER)**: New dedicated menu featuring:
    - **Caesar Cipher**: Shift-based encryption.
    - **Atbash Cipher**: Mirror substitution.
    - **Simple Substitution**: Keyword-based mixed alphabet.
    - **Playfair Cipher**: Bigram-based key matrix encryption.
    - **Columnar Transposition**: Key-shuffled grid transposition.
- **Interactive Controls**: Added adaptive key/keyword inputs and toggles for encryption/decryption modes.

### 📧 Messaging Enhancements
- **Direct Email Integration**: Replaced general Web Share in the Outbox Message Viewer with a direct **Email** button.
- **Auto-Formatting**: Automatically populates email subject and body with formal IARU Radiogram data.
- **Outbox UI**: Streamlined saved message previews and viewer modal.

### 🎨 UI & Branding (DARES)
- **Official Identity**: Integrated the **DARES Shield Logo** (PNG) across all platforms.
- **Desktop Sidebar**: Repositioned logo above the title with enlarged, transparent presentation for a premium look.
- **Typography**: Consistent use of the **Orbitron** font for tactical mission aesthetics.
- **Branding**: Unified the suite under the official **Digital Amateur Radio Emergency Suite (DARES)** title.
- **LOGGER**: Renamed "Tactical logger" to **LOGGER** for faster navigation.

### 🛠️ Technical Fixes
- **Build Optimization**: Resolved Tailwind CSS opacity variable issues in `index.css`.
- **Base Integration**: Optimized GitHub Pages deployment pathing for nested folder structures.
- **Persistence**: Enhanced LocalStorage handling for station settings and outbox messages.

---
73 de 9M2PJU
