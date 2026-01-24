<div align="center">

# 📡 MySET Digital Notepad
### Malaysian Amateur Radio Simulated Emergency Test Tool

[![Deploy to GitHub Pages](https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/actions/workflows/deploy.yml/badge.svg)](https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/actions/workflows/deploy.yml)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)

<p align="center">
  <img src="https://images.unsplash.com/photo-1626266061368-46a8383a8080?q=80&w=2670&auto=format&fit=crop" width="600" alt="Tactical Radio Setup">
</p>

*A lightweight, offline-capable digital logging assistant for Malaysian Amateur Radio operators during emergency communication exercises.*

[**🚀 Launch App**](https://9M2PJU.github.io/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/) · [Report Bug](https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/issues) · [Request Feature](https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad/issues)

</div>

---

## ⚡ Key Features

- **📝 Tactical Logger**: Rapidly log contacts (Callsign, Freq, RST, Remarks) with one hand.
- **📄 ICS-213 Generator**: Create standard emergency messages compatible with MARTS/IARU protocols.
- **💾 Auto-Save**: All data is stored locally in your browser—no internet required.
- **📊 CSV Export**: Download your logs instantly for easy report submission.
- **🌙 Tactical Theme**: High-contrast dark mode designed for low-light field operations.
- **🔋 Privacy Focused**: No cloud tracking. Your data stays on your device.

## 🛠️ Usage

1. **Station Setup**: Enter your **Callsign** and **Grid Square** at the top. (These reset when you close the tab for privacy).
2. **Logging**: Use the **Tactical Logger** tab for quick QSOs.
    - Hit `Enter` to save a log.
    - Click `Export CSV` to save your work.
3. **Messages**: Use the **ICS-213** tab to draft formal traffic.
    - Use `Copy Text` to paste into WhatsApp or digital modes (JS8Call/Fldigi).

## 🚀 Development

This project is built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/).

### Prerequisites
- Node.js (v18+)
- npm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Simulated-Emergency-Test-Notepad.git

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Deployment
This repo is configured with **GitHub Actions** to automatically deploy to GitHub Pages.
1. Push to `main`.
2. The action builds the `dist` folder and pushes it to `gh-pages`.
3. Ensure your Repo Settings > Pages is set to build from the `gh-pages` branch.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <small>Built with ❤️ for the Malaysian Amateur Radio Community by 9M2PJU</small>
</div>
