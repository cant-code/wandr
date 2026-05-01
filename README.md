# Wandr — AI Travel Planner

Plan trips. Share the adventure.

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore + Realtime Listeners)
- **AI**: Client-side calls to OpenAI / Anthropic / Gemini (user's own keys)
- **Deploy**: Firebase Hosting

## Setup

### 1. Firebase
1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable **Authentication** and enable:
   - Email Link (passwordless sign-in)
   - Google provider
3. Create a **Firestore Database** in **Production mode** (or test mode for dev) and set up security rules.
4. **Important: Firestore Indexes**. Firestore requires composite indexes for complex queries (where + order by).
   - The easiest way to create them is to click the links provided in the browser console errors when you first run the app.
   - Alternatively, you can deploy the `firestore.indexes.json` file using the Firebase CLI.
5. Add a Web App to your project and get the configuration.
6. **Firebase Hosting**: The project is pre-configured for Firebase Hosting.

### 2. Environment
```bash
cp .env.example .env
```
Fill in your Firebase configuration from the Firebase Console.

### 3. Install & run
```bash
pnpm install
pnpm dev
```

### 4. Deploy to Firebase Hosting
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build and deploy
pnpm run build
firebase deploy --only hosting
```

## Project structure
```
src/
  lib/
    firebase.js     # Firebase client
    ai.js           # AI orchestrator (OpenAI / Anthropic / Gemini)
  hooks/
    useAuth.jsx     # Auth context + hook
    useTrips.js     # Trip CRUD + realtime + sharing
  pages/
    LandingPage.jsx
    AuthPage.jsx    # Magic link + Google OAuth
    DashboardPage.jsx
    TripPage.jsx    # Main trip view with 4 tabs
    SettingsPage.jsx # API key management
    JoinPage.jsx    # Invite link handler
  components/
    Navbar.jsx
    NewTripModal.jsx
    ShareModal.jsx
    panels/
      PlacesPanel.jsx
      FlightsPanel.jsx
      HotelsPanel.jsx
      ChatPanel.jsx
```

## Key design decisions
- **API keys never leave the browser** — stored in localStorage, sent directly to AI provider APIs
- **No custom backend server** — Firebase handles everything
- **RLS enforced at DB level** — trip data is isolated by membership even if client logic is bypassed
- **Real-time collaboration** — Firebase Realtime broadcasts suggestion changes to all trip members

## Bugs
- Fix Redirect after login, have to click on login again
- SSO Login for Gmail
- Cannot see joined trips in dashboard