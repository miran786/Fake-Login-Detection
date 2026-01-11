# Fake Login Detection & Security UI

This project demonstrates a secure, ML-powered login interface with a "Fake Login Detection" theme. It mirrors a modern security platform's authentication flow, featuring a premium UI built with **React**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI**.

## Features

-   **Premium UI/UX**: Glassmorphism effects, complex animations, and a high-end design language.
-   **Functional Authentication**:
    -   **Sign Up**: Registers users locally (stored in browser `localStorage`).
    -   **Sign In**: Validates credentials against stored users.
    -   **Persistance**: Stays logged in across page reloads.
-   **Simulated ML Security**:
    -   Displays a "Risk Score" upon login.
    -   Simulates security checks and delays.
-   **Dashboard**: A protected route that is only accessible after login.

## Tech Stack

-   **React 19**
-   **TypeScript**
-   **Tailwind CSS v4** (configured via PostCSS)
-   **Shadcn UI** (Radix Primitives)
-   **Craco** (for overriding Create React App configuration)

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: This project uses `craco` to handle Tailwind v4 and TypeScript configurations.*

### Running the App

Start the development server:

```bash
npm start
```

This will run `craco start` and open the app at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## "Fake Login" Feature

This app is designed to *simulate* a login detection system.
-   **No Real Backend**: All user data is stored safely in your browser's LocalStorage.
-   **Privacy**: No data leaves your machine.
-   **Demo Mode**: You can create any account you want to test the flow.

## Project Structure

-   `src/components`: UI components (Pages and Shadcn UI primitives).
-   `src/context`: React Context for Authentication.
-   `src/styles`: Global styles, Tailwind setup, and theme variables.
