# Travel N Joy | Premium Pre-Owned Cars

## 👋 Welcome
Welcome to the Travel N Joy platform. This project is a modern, high-performance web application designed for a premium pre-owned car dealership. It seamlessly blends a beautiful customer-facing showroom with a powerful, automated administrative backend.

## ✨ Key Features
This platform isn't just a static display. It's fully engineered for business automation:

- **Two-Way Database Syncing:** Built on a robust Firebase Firestore database that automatically syncs in real-time with Google Sheets via Apps Script, providing a familiar spreadsheet interface for quick backups and management.
- **Automated Email Notifications:** Integrated SMTP email workflows using Nodemailer to instantly send beautiful, responsive HTML emails to customers and admins whenever a car is reserved or sold.
- **Admin Dashboard:** A highly secure portal allowing admins to manage inventory, upload car photos directly to Cloudinary, track buyer details, and securely manage PDF documents (RC, Insurance, PAN, Aadhar).
- **Immersive UI & Animations:** Built with modern design aesthetics, featuring stunning gradients, interactive hover effects, and smooth page transitions.
- **Optimized Media Delivery:** All car photos are optimized and delivered via Cloudinary for lightning-fast load times.

## 🛠️ Built With
The core technology stack was chosen for maximum performance and developer experience:

### Core
- [React 19](https://react.dev/): For building a component-based, interactive UI.
- [Next.js 16](https://nextjs.org/): Utilizing the App Router for server-side rendering, secure API routes, and optimal performance.
- [TypeScript](https://www.typescriptlang.org/): For type-safe, maintainable code across both frontend and backend.

### Styling & Animation
- [Tailwind CSS](https://tailwindcss.com/): For rapid, utility-first styling and a completely custom design system without UI libraries.
- [Framer Motion](https://www.framer.com/motion/): Powering the smooth, complex animations and page transitions.

### Data & APIs
- [Firebase Firestore](https://firebase.google.com/docs/firestore): Serverless NoSQL document database.
- [Google Sheets API / Apps Script](https://developers.google.com/apps-script): Real-time spreadsheet synchronization.
- [Cloudinary](https://cloudinary.com/): Cloud media management and CDN.
- [Nodemailer](https://nodemailer.com/): SMTP Email processing.

## 🚀 Getting Started
If you'd like to run this locally:

```bash
# Clone the repo
git clone https://github.com/GhostRed256/TravelNJoy.git

# Install dependencies
npm install

# Setup Environment Variables
# Copy .env.example to .env.local and add your Firebase, Cloudinary, and SMTP credentials.

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to check it out.

## 📄 License
Open source under the [MIT License](https://github.com/GhostRed256/TravelNJoy/blob/master/LICENSE).

---
Made with ❤️ by Ritesh Dey
