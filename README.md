# Fake Login Detection & Security UI

This project demonstrates a secure, ML-powered login interface with a "Fake Login Detection" theme. It mirrors a modern security platform's authentication flow, featuring a premium UI built with **React**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI**.

## Features

-   **Premium UI/UX**: Glassmorphism effects, complex animations, and a high-end design language.
-   **Functional Authentication & Security**:
    -   **Sign Up**: Registers users locally (stored in browser `localStorage`).
    -   **Sign In**: Validates credentials against stored users.
    -   **Forgot Password (OTP)**:
        -   Uses **EmailJS** to send real 6-digit verification codes to your email.
        -   **Security Check**: User existence is verified before sending any emails.
    -   **Persistance**: Stays logged in across page reloads.
-   **Dashboard & Analytics**:
    -   **Real-time Location**: Fetches user's public IP and location using `ipapi.co`.
    -   **Device Fingerprinting**: Detects browser, OS, and device type.
    -   **Live Metrics**: Dynamic trend analysis for successful, flagged, and blocked logins.
-   **Simulated ML Security**:
    -   Displays a "Risk Score" upon login.
    -   Simulates security checks and delays.

## Tech Stack

-   **React 19**
-   **TypeScript**
-   **Tailwind CSS v4** (configured via PostCSS)
-   **Shadcn UI** (Radix Primitives)
-   **EmailJS** (for email service)
-   **Craco** (for overriding Create React App configuration)

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm

### Environment Setup

Create a `.env` file in the root directory with your EmailJS credentials:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

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

This app is designed to *simulate* a login detection system with some real-world integrations.
-   **No Real Backend**: User data is stored in your browser's LocalStorage.
-   **Email Functionality**: Uses client-side EmailJS to send OTPs.
-   **Live Data**: Uses public APIs (ipapi) for location data.
-   **Privacy**: No data leaves your machine.
-   **Demo Mode**: You can create any account you want to test the flow.

## Project Structure

-   `src/components`: UI components (Pages and Shadcn UI primitives).
-   `src/context`: React Context for Authentication.
-   `src/styles`: Global styles, Tailwind setup, and theme variables.
