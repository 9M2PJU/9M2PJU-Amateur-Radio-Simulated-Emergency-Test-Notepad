# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-01-25
### Added
- **IARU Radiogram Form**: Completely replaced ICS-213 with the standard IARU Message Form (Radiogram).
- **Tactical Dark Theme**: Updated the message form to match the app's dark "Tactical" aesthetic (Slate/Cyan/Amber).
- **Timezone Toggle**: Added support for toggling between UTC (Z) and Local (L) time in the message form.
- **Precedence**: Added "EMERGENCY" option to message precedence.

### Changed
- **Form Layout**: Redesigned inputs to match the physical IARU radiogram paper layout.
- **Message Format**: updated `generateText` to produce a verbose, operator-friendly text format.
- **Footer Text**: Changed "Sent free by..." to "Sent by...".
- **Documentation**: Updated README to reflect the shift from ICS-213 to Radiograms.

### Fixed
- **Logger UI**: Fixed an issue where the Time input was truncated in the Tactical Logger.

## [1.2.0] - 2026-01-24
### Added
- **Orbitron Theme**: Complete UI overhaul with futuristic neon aesthetics and glassmorphism.
- **Station Persistence**: Call sign, grid, and power settings now persist between sessions using LocalStorage.
- **Tactical Logger Upgrades**:
    - Added "Mode" selector (FM, AM, USB, LSB, CW, DIG).
    - Auto-appends Power Status (`[MAINS]` or `[BATT]`) to remarks.
    - Enforced Malaysia Standard Time (MYT) for all logging timestamps.
- **ICS-213 Enhancements**:
    - Added "Print" button for printer-friendly message formatting.
    - Added "Priority" dropdown (ROUTINE, PRIORITY, EMERGENCY) with visual indicators.
    - Auto-fills "From" fields based on Station Settings.
- **Footer**: Updated branding to "MADE FOR 🇲🇾 BY 9M2PJU".

### Changed
- **App Subtitle**: Renamed to "DIGITAL AMATEUR RADIO EMERGENCY SUITE".
- **Typography**: Switched to 'Orbitron' for headers/data and 'Inter' for body text.
- **Responsiveness**: Improved mobile layout for bottom navigation and forms.

## [1.0.0] - 2026-01-20
### Initial Release
- Basic Tactical Logger with CSV Export.
- Standard ICS-213 Message Form.
- LocalStorage based data persistence.
- Offline-capable PWA foundation.
