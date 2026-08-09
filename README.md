# 🚀 Nexus Student Companion

**Nexus Student Companion (NSC)** is an all-in-one student productivity app designed to help students stay organized, connected, and productive.

## ✨ Features

* 📚 **Student Dashboard** — Quickly access important tools and information.
* 💬 **Messaging** — Chat with other users in real time.
* 📞 **Calling** — Voice calling and communication features.
* 🤖 **AI Assistant** — Get help with questions, studying, and everyday tasks.
* 🔐 **Authentication** — Secure user sign-in and account management.
* 👤 **Profiles** — Customize your student profile.
* 🔔 **Notifications** — Stay updated with important activity.
* 📱 **PWA Support** — Install Nexus Student Companion like an app on supported devices.
* 🎨 **Modern UI** — Clean, responsive interface designed for students.

## 🛠️ Built With

* **React**
* **Vite**
* **JavaScript**
* **Firebase**
* **Tailwind CSS**
* **Lucide React**
* **WebRTC**
* **Google Gemini API**

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root of the project.

Example:

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_FIREBASE_API_KEY=your_api_key_here
```

Add any other environment variables required by the project.

> ⚠️ Never commit `.env.local` or other files containing private credentials to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The app should now be available at your local development address.

## 🏗️ Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## ☁️ Deployment

Nexus Student Companion can be deployed using **Vercel**.

For Vercel deployment:

1. Import the GitHub repository into Vercel.
2. Set the required environment variables in Vercel.
3. Use the Vite build configuration.
4. Deploy the project.

Typical settings:

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

## 🔐 Security

Environment files containing credentials should never be committed to the repository.

Make sure `.gitignore` includes:

```gitignore
.env
.env.local
.env.*.local
```

Firebase Security Rules should also be configured appropriately before using the application in production.

## 📁 Project Structure

```text
src/
├── components/
├── context/
├── data/
├── pages/
├── services/
├── App.jsx
└── main.jsx

public/
├── icons/
└── ...

.env.local
.gitignore
package.json
vite.config.js
```

## 📌 Status

🚧 **Nexus Student Companion is actively being developed.**

New features, improvements, and bug fixes are being added regularly.

## 📄 License

This project is currently for educational and personal use.
