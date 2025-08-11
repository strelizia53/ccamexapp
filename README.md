# AMEX Training Portal

AMEX Training Portal is a web application for managing company training programs. Built with **Next.js 15** and **Firebase**, it allows users to register, browse and enroll in training sessions while providing dedicated dashboards for administrators, trainers, and trainees.

## Features

- 🔐 **Firebase Authentication** with email/password sign‑up and login
- 👥 **Role‑based dashboards**
  - **Admin**: create and search training programs
  - **Trainer**: view own programs and enrolled trainees
  - **Trainee**: manage registrations and upcoming sessions
- 📚 **Program catalogue** with search, pagination, and enrollment
- ⭐ **Program feedback** with ratings and comments
- ☁️ **Firebase Hosting & Cloud Functions** configuration for deployment

## Tech Stack

- [Next.js](https://nextjs.org/) 15 (App Router, React 19)
- [Firebase](https://firebase.google.com/) Authentication & Firestore
- Cloud Functions for server‑side Next.js hosting
- ESLint for linting

## Project Structure

```
.
├── src
│   ├── app            # Application routes (admin, trainer, trainee, programs)
│   ├── components     # Shared UI components
│   └── firebase       # Firebase configuration
├── functions          # Firebase Cloud Function serving Next.js
├── firebase.json      # Firebase Hosting configuration
└── package.json       # Root project config and scripts
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install              # install root dependencies
   cd functions && npm install   # install Cloud Function deps
   ```
2. **Configure Firebase**
   - Replace the values in [`src/firebase/config.js`](src/firebase/config.js) with your own Firebase project credentials.
3. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit <http://localhost:3000> to view the app.

## Available Scripts

- `npm run dev` – start the Next.js development server
- `npm run build` – build the production bundle
- `npm start` – run the built app
- `npm run lint` – run ESLint

## Deployment

The repository includes configuration for Firebase Hosting and a Cloud Function that serves the Next.js app. To deploy:

```bash
npm run build               # generate the .next production build
firebase deploy             # deploy hosting and functions
```

Ensure you are logged in with the Firebase CLI and have the project set in `.firebaserc` before deploying.

## License

This project is released without a specific license. Feel free to adapt it for your needs.
