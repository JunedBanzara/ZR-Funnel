# ZR-Funnel — ZR Interior Design High-Conversion Funnel

> **Bespoke Luxury Interior Architecture & Turnkey Execution**  
> Serving Vadodara, Gujarat & Across India | Legacy Established 1990–2026  
> Principal Designer: **Mr. Zuber Banzara**

---

## 🏛️ Project Overview

**ZR-Funnel** is a high-converting, mobile-first web application and lead funnel built specifically for **ZR Interior Design**, a premier architectural and interior design studio with over 36 years of heritage and 500+ delivered residences and commercial spaces.

The application is engineered to convert high-net-worth traffic from Instagram, Meta Ads, and direct referrals into qualified, committed 45-minute architectural consultation bookings.

---

## ✨ Key Features

- **Architectural Luxury Aesthetic**: Designed with an editorial typography hierarchy, curated color palette (Warm Limestone `#F2EEE7`, Deep Charcoal `#141312`, Warm Bronze `#8E6D3A`), smooth micro-animations, and elevated contrast ratios.
- **Interactive Heritage Timeline (1990–2026)**: Visual milestone journey from the 1990 founding hand-carved wood workshop to 2026 nationwide turnkey design operations.
- **Interactive Curated Portfolio**: High-resolution gallery featuring Living Rooms, Modular Kitchens, Master Suites, and Commercial projects with modal inspection and design briefs.
- **Dynamic Cost & Budget Estimator**: Real-time project cost calculator by property type, carpet area, and scope tier (Essential, Premium, Bespoke Turnkey).
- **Integrated Consultation Booking Funnel**: Multi-step booking modal collecting project details, property timeline, and consultation preferences.
- **Razorpay Payment Integration**: Integrated checkout for the ₹199 discovery consultation commitment fee.
- **WhatsApp Cloud API Integration**: Automated instant booking confirmations and direct WhatsApp VIP chat link.
- **Calendly Embed Ready**: Seamless scheduling flow for confirmed consultation slots.
- **Mobile-First & Performance-Optimized**: Lightning-fast asset delivery powered by Vite, semantic HTML5, and responsive vanilla CSS.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), Semantic HTML5, Vanilla CSS3 (Custom Design Token System)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Backend / API**: Node.js, Express
- **Payment Processing**: [Razorpay API](https://razorpay.com/)
- **Communication & Automation**: WhatsApp Cloud API (Meta Graph API) & Calendly
- **Analytics & Tracking**: Meta Pixel & Conversions API ready

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JunedBanzara/ZR-Funnel.git
   cd ZR-Funnel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your API credentials:
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `CALENDLY_URL`
   - `WHATSAPP_PHONE_NUMBER_ID` & `WHATSAPP_ACCESS_TOKEN`
   - `META_PIXEL_ID`

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Start the backend server (optional for payment & booking API)**:
   ```bash
   node server/app.js
   ```

---

## 📦 Project Structure

```
ZR-Funnel/
├── assets/
│   ├── images/
│   │   ├── FinalImages/      # Selected high-res luxury project assets & timeline
│   │   ├── extracts/         # Curated architectural renderings & photos
│   │   └── ...
│   └── icons/
├── data/                     # Data persistence (.gitkeep, runtime JSON ignored)
├── server/
│   ├── app.js                # Express API server for payments & bookings
│   └── routes/               # API route handlers
├── src/
│   ├── js/
│   │   ├── booking.js        # Multi-step booking funnel logic
│   │   ├── calculator.js     # Real-time budget estimator
│   │   ├── form.js           # Form validation & submission
│   │   ├── gallery.js        # Lightbox & portfolio filtering
│   │   ├── main.js           # Navigation, scroll animations & observers
│   │   ├── payment.js        # Razorpay client integration
│   │   └── whatsapp.js       # WhatsApp notification handler
│   └── styles/
│       ├── base.css          # Reset, typography & global layouts
│       ├── components.css    # Cards, buttons, modals & interactive elements
│       └── variables.css     # Luxury design token system & color variables
├── .env.example              # Example environment configuration
├── .gitignore                # Git exclusions (credentials, node_modules, dist)
├── index.html                # Main landing page markup
├── package.json
└── vite.config.js            # Vite configuration
```

---

## 📍 Business & Contact Information

- **Studio**: ZR Interior Design
- **Principal Designer**: Mr. Zuber Banzara
- **Studio Address**: 304, Raama Crest, Near HCG Cancer Center, Sunpharma Road, Vadodara, Gujarat 390012, India
- **Phone**: [+91 7878588859](tel:+917878588859)
- **Email**: [zrinteriordesign@gmail.com](mailto:zrinteriordesign@gmail.com)

---

## 📄 License

Proprietary © 2026 ZR Interior Design. All rights reserved.
