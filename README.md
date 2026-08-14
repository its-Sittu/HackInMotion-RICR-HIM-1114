# PulseMed 🩺

**PulseMed** is a modern, full-stack Smart Medicine Safety & Drug Interaction Platform designed to empower patients and healthcare providers with real-time health analytics, AI-assisted medication safety checks, appointment scheduling, and automated OTP authentication.

---

## 🚀 Key Features

* **Instant OTP Authentication**: Secure account creation and password reset powered by EmailJS API & bcrypt hashing.
* **Time-Based Personalization**: Dynamic greetings and customized dashboard views tailored to the time of day (Morning, Afternoon, Evening, Night).
* **Medication Safety Overview**: Real-time bio-rhythm tracking, heart rate monitoring, blood pressure trends, and step counters.
* **Telehealth Integration**: One-click telehealth room access and doctor appointment management.
* **Medical Records Storage**: Centralized hub for diagnostic reports and prescription documentation.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, React Router v7, Vite, CSS3 Glassmorphism
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication
* **Security & Communications**: EmailJS API, bcrypt password hashing, CORS, Express Rate Limit
* **Quality & CI/CD**: ESLint v9, GitHub Actions Workflows

---

## 📦 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* MongoDB (Local instance or MongoDB Atlas URI)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/its-Sittu/HackInMotion-RICR-HIM-1114.git
   cd HackInMotion-RICR-HIM-1114
   ```

2. **Install Dependencies**:
   ```bash
   # Install Frontend Dependencies
   npm install

   # Install Backend Dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=mongodb://127.0.0.1:27017/pulsemed
   JWT_SECRET=your_jwt_secret_key_here
   EMAILJS_SERVICE_ID=service_ogg9o51
   EMAILJS_TEMPLATE_ID=template_8xnuo4b
   EMAILJS_PUBLIC_KEY=uqQIboA5idT8wp2fc
   ```

4. **Run Development Servers**:
   ```bash
   # Start Backend (Terminal 1)
   cd backend
   npm run dev

   # Start Frontend (Terminal 2)
   npm run dev
   ```

---

## 🧪 Testing & Code Quality

Run ESLint code quality checks:
```bash
npm run lint
```

---

## 📄 License

This project is open source under the MIT License.
