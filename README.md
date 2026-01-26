<div align="center">

# 💬 Velin

## Messaggistica sicura e privata per tutti

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with Vue](https://img.shields.io/badge/Made%20with-Vue.js-42b883?logo=vue.js)](https://vuejs.org)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-24C8DB?logo=tauri)](https://tauri.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Endless-Team/velin/pulls)

[Caratteristiche](#-caratteristiche) •
[Download](#-download) •
[Installazione](#-installazione) •
[Sviluppo](#-sviluppo) •
[Contribuire](#-contribuire) •
[Licenza](#-licenza)

---

<!-- ![Velin Screenshot](docs/images/screenshot.png) -->

</div>

## 📖 Cos'è Velin?

Velin è una piattaforma di **messaggistica istantanea** moderna e open-source, progettata per conversazioni **fluide, sicure e private**.

Con crittografia end-to-end, sincronizzazione cloud in tempo reale e un'interfaccia utente intuitiva, Velin offre un'esperienza di messaggistica di livello professionale senza compromessi sulla privacy.

## ✨ Caratteristiche

### 🔒 Sicurezza e Privacy

- **Crittografia End-to-End** - I tuoi messaggi sono visibili solo a te e al destinatario
- **Zero Raccolta Dati** - Non tracciamo, non vendiamo, non condividiamo i tuoi dati
- **Autenticazione a Due Fattori** - Protezione extra per il tuo account
- **Messaggi Effimeri** - Auto-distruzione dei messaggi per conversazioni ultra-private

### ⚡ Performance

- **Velocità Fulminea** - Messaggi istantanei con latenza minima
- **Sincronizzazione Real-Time** - I tuoi messaggi sincronizzati su tutti i dispositivi
- **Ottimizzazione Risorse** - Leggero e performante anche su hardware meno potente

### 🎨 Esperienza Utente

- **Design Moderno** - Interfaccia pulita e intuitiva ispirata a Discord
- **Dark Mode** - Perfetto per sessioni notturne
- **Responsive** - Si adatta perfettamente a qualsiasi dimensione dello schermo
- **Accessibile** - Pensato per essere usabile da tutti

### 🌍 Multipiattaforma

- **Windows** (10/11)
- **macOS** (10.13+)
- **Linux** (Ubuntu, Debian, Fedora)
- **Web** (Tutti i browser moderni)
- **iOS** (Coming soon)
- **Android** (Coming soon)

## 🚀 Download

Scarica l'ultima versione per il tuo sistema operativo:

| Piattaforma    | Download                                                                                                               | Requisiti                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 🪟 **Windows** | [Download (.exe)](https://github.com/Endless-Team/Velin-chat/releases/latest/download/Velin_1.0.0_x64-setup.exe)       | Windows 10+ (64-bit)      |
| 🍎 **macOS**   | [Download (.dmg)](https://github.com/Endless-Team/Velin-chat/releases/latest/download/Velin_1.0.0_x64.dmg)             | macOS 10.13+              |
| 🐧 **Linux**   | [Download (.AppImage)](https://github.com/Endless-Team/Velin-chat/releases/latest/download/velin_1.0.0_amd64.AppImage) | Ubuntu 18.04+, Debian 10+ |
| 🌐 **Web**     | [Apri App Web](https://velin.app)                                                                                      | Browser moderno           |

> 💡 **Vedi tutte le release:** [Releases Page](https://github.com/Endless-Team/Velin-chat/releases)

## 🛠️ Tech Stack

Velin è costruito con tecnologie moderne e affidabili:

### Frontend

- **[Vue 3](https://vuejs.org/)** - Framework JavaScript progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript con tipizzazione statica
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Vite](https://vitejs.dev/)** - Build tool ultra-veloce

### Backend

- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service
  - Authentication - Gestione utenti
  - Firestore - Database NoSQL in tempo reale
  - Storage - Archiviazione file

### Desktop

- **[Tauri](https://tauri.app/)** - Framework per applicazioni desktop
- **[Rust](https://www.rust-lang.org/)** - Backend performante e sicuro

### Routing & State

- **[Vue Router](https://router.vuejs.org/)** - Routing client-side
- **Pinia** (opzionale) - State management

## 📦 Installazione

### Prerequisiti

Assicurati di avere installato:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** o **pnpm** o **yarn**
- **Rust** (solo per build desktop) ([Install](https://www.rust-lang.org/tools/install))

### Clone del Repository

```bash
git clone https://github.com/Endless-Team/Velin-chat.git
cd Velin-chat
```

### Installa le Dipendenze

```bash
npm install
```

### Configurazione Firebase

1. Crea un progetto su [Firebase Console](https://console.firebase.google.com/)
2. Abilita Authentication (Email/Password)
3. Crea un database Firestore
4. Copia le credenziali Firebase
5. Crea il file `.env` nella root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 💻 Sviluppo

### Web App (Development)

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

### Desktop App (Development)

```bash
npm run tauri dev
```

### Build per Produzione

#### Web

```bash
npm run build
```

I file saranno generati in `dist/`

#### Desktop (Windows, macOS, Linux)

```bash
npm run tauri build
```

I file saranno generati in `src-tauri/target/release/bundle/`

## 📁 Struttura del Progetto

```text
velin/
├── src/                      # Codice sorgente frontend
│   ├── components/           # Componenti Vue riutilizzabili
│   ├── views/                # Pagine dell'applicazione
│   ├── router/               # Configurazione routing
│   ├── firebase.ts           # Configurazione Firebase
│   ├── App.vue               # Componente root
│   └── main.ts               # Entry point
├── src-tauri/                # Codice Tauri/Rust
│   ├── src/                  # Codice Rust
│   ├── icons/                # Icone app
│   ├── Cargo.toml            # Dipendenze Rust
│   └── tauri.conf.json       # Configurazione Tauri
├── public/                   # Asset statici
├── docs/                     # Documentazione
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       └── release.yml       # Build automatiche
├── index.html                # HTML entry point
├── package.json              # Dipendenze Node
├── vite.config.ts            # Configurazione Vite
├── tailwind.config.js        # Configurazione Tailwind
├── tsconfig.json             # Configurazione TypeScript
└── README.md                 # Questo file
```

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

### Come Contribuire

1. **Fork** il progetto
2. Crea il tuo **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. Apri una **Pull Request**

### Linee Guida

- Scrivi codice pulito e commentato
- Segui le convenzioni di naming esistenti
- Aggiungi test per nuove funzionalità
- Aggiorna la documentazione se necessario

### Reportare Bug

Apri una [nuova issue](https://github.com/Endless-Team/Velin-chat/issues/new) descrivendo:

- Il problema riscontrato
- Steps per riprodurlo
- Comportamento atteso vs. effettivo
- Screenshots (se applicabile)
- Sistema operativo e versione di Velin

## 🗺️ Roadmap

- [x] Messaggistica base
- [x] Crittografia end-to-end
- [x] Sincronizzazione multi-dispositivo
- [x] Desktop app (Windows, macOS, Linux)
- [ ] Chiamate vocali
- [ ] Videochiamate
- [ ] Condivisione file
- [ ] App mobile (iOS/Android)
- [ ] Gruppi e canali
- [ ] Bot e integrazioni
- [ ] Self-hosting option

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👥 Autori

- **Endless Team** - _Initial work_ - [@Endless-Team](https://github.com/Endless-Team)

Vedi anche la lista di [contributors](https://github.com/Endless-Team/Velin-chat/contributors) che hanno partecipato al progetto.

## 🙏 Ringraziamenti

- [Vue.js Team](https://vuejs.org/) per il fantastico framework
- [Tauri Team](https://tauri.app/) per aver reso possibili app desktop leggere
- [Firebase](https://firebase.google.com/) per l'infrastruttura backend
- Tutti i [contributors](https://github.com/Endless-Team/Velin-chat/graphs/contributors) che hanno aiutato il progetto

<!-- ## 📞 Contatti

- **Website:** [velin.app](https://velin.app)
- **Email:** <support@velin.app>
- **Twitter:** [@velinapp](https://twitter.com/velinapp)
- **Discord:** [Join our community](https://discord.gg/velin) -->

---

<div align="center">

### ⭐ Se ti piace Velin, lascia una stella su GitHub! ⭐

Made with ❤️ by the Endless Team

![GitHub stars](https://img.shields.io/github/stars/Endless-Team/Velin-chat?style=social)
![GitHub forks](https://img.shields.io/github/forks/Endless-Team/Velin-chat?style=social)
![GitHub issues](https://img.shields.io/github/issues/Endless-Team/Velin-chat)
![GitHub release](https://img.shields.io/github/v/release/Endless-Team/Velin-chat)

</div>
