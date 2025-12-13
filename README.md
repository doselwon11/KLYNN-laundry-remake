# 🧺 KLYNN Door-to-Door Laundry
## Customer App (React Native + Expo)

KLYNN is a door-to-door laundry service customer application that allows users to sign up, manage their profiles, place laundry pickup orders, and track order statuses.

This project is built using React Native (Expo) with Supabase as the backend.

## 🚀 Tech Stack
* **Frontend**: React Native (Expo)
* **Routing**: Expo Router
* **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
* **Authentication**: Supabase Email/Password Auth
* **Location Services**: GPS + Reverse Geocoding (OpenStreetMap / Nominatim)
* **Styling**: React Native + Expo Linear Gradient 

## ✨ Features

* User authentication (Sign Up / Sign In)
* Profile management (name, phone, address)
* Dynamic country & state/province selection
* Laundry order placement
  * Pickup type: Economy / Express
  * Service type: Normal / Express
  * Pickup address options:
    * Registered profile address
    * Current GPS location
    * Custom address input
* Order tracking with real-time status updates
* Clean, mobile-friendly tab navigation UI 

## 📂 Project Structure (Simplified)

```
project-root/
├─ app/
│  ├─ (tabs)/
│  │  ├─ _layout.tsx      # Tab layout & headers
│  │  ├─ index.tsx        # Home
│  │  ├─ order.tsx        # Place new order
│  │  ├─ track.tsx        # Track orders
│  │  ├─ profile.tsx     # Profile & authentication
│
├─ assets/
│  └─ images/
│     └─ klynn-logo.png
│
├─ lib/
│  └─ supabase.ts         # Supabase client
│
├─ components/
│  ├─ Card.tsx
│  ├─ PrimaryButton.tsx
│
└─ README.md
```

## 🧑‍🏫 Instructions for Local Testing
### 1️⃣ Prerequisites

Please ensure the following are installed:
* Node.js (v18 or newer recommended)
* npm or yarn
* Expo CLI

`npm install -g expo-cli`

### 2️⃣ Install Dependencies

From the project root:
`npm install` or `yarn install`

### 3️⃣ Environment Variables (Supabase)

Create a `.env` file in the project root with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://aerbkrsskxbsvjattofq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcmJrcnNza3hic3ZqYXR0b2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzM1MDIsImV4cCI6MjA4MDQ0OTUwMn0.OUVlzVxdy_DgHi9redKhp5YweH0oCg3kH7BFFQsP6m4
```
✅ Important Note for Evaluation:
Supabase anon keys are public by design and are safe to use in client applications.
All sensitive access is protected using Row Level Security (RLS).

### 4️⃣ Run the App Locally
`npx expo start`
You may run the app using:
* 🌐 Web browser
* 📱 Android Emulator
* 🍎 iOS Simulator
* 📲 Expo Go (scan the QR code)

### 🔐 Authentication Notes
* Users can sign up using any valid email and password
* After signing up, users must complete their profile
* A valid profile address is required before placing an order

### 🧪 Suggested Testing Flow (For Evaluation)

1. Sign up as a new user
2. Complete profile details (name, phone, address)
3. Navigate to Order
    * Select package
    * Select pickup type and service type
    * Choose pickup address option
4. Place an order
5. Navigate to Track to view order status
6. Log out and sign back in to confirm data persistence 

### 🛡️ Security & Data Safety

* Uses Supabase Authentication
* Implements Row Level Security (RLS) on all tables
* Users can only access their own data
* No service-role or admin keys are exposed in the client app

### 📄 License
This project is intended for academic and demonstration purposes only.