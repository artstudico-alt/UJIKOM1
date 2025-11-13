# 🚀 Event Management System - Frontend React

Frontend React modern untuk sistem manajemen event dengan fitur lengkap authentication, dashboard, dan manajemen event.

## ✨ Fitur Utama

### 🔐 Authentication & Authorization
- **Login/Register** - Form modern dengan validasi Yup
- **Email Verification** - Verifikasi email dengan OTP
- **Password Reset** - Reset password yang aman
- **Role-based Access** - Admin dan User roles
- **Protected Routes** - Route protection otomatis

### 📊 Dashboard
- **Statistics Cards** - Total event, peserta, sertifikat
- **Recent Events** - Event terbaru dengan status
- **Quick Actions** - Aksi cepat untuk admin
- **Activity Logs** - Log aktivitas terbaru
- **Responsive Design** - Mobile-first approach

### 🎯 Event Management
- **CRUD Events** - Create, Read, Update, Delete events
- **Event Status** - Upcoming, Ongoing, Completed, Cancelled
- **Participant Management** - Tambah/hapus peserta
- **Import/Export** - Excel import/export peserta
- **Attendance Tracking** - Tracking kehadiran

### 🏆 Certificate System
- **Generate Certificates** - Generate sertifikat otomatis
- **Download Certificates** - Download dalam format PDF
- **Certificate Search** - Pencarian sertifikat publik
- **Bulk Generation** - Generate semua sertifikat sekaligus

### 📱 Modern UI/UX
- **Material-UI v5** - Design system modern
- **Responsive Layout** - Mobile, tablet, desktop
- **Dark/Light Theme** - Tema yang dapat disesuaikan
- **Loading States** - Skeleton loading dan progress bars
- **Error Handling** - Error handling yang user-friendly

## 🛠️ Tech Stack

- **React 18** - Latest React version
- **TypeScript** - Type safety
- **Material-UI v5** - UI components
- **React Router v6** - Client-side routing
- **React Hook Form** - Form management
- **Yup** - Form validation
- **Axios** - HTTP client
- **React Query** - Server state management
- **Emotion** - CSS-in-JS styling

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm atau yarn
- Backend Laravel running di `http://localhost:8000`

### Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
REACT_APP_API_URL=http://localhost:8000/api

# Start development server
npm start
```

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=Event Management System
REACT_APP_VERSION=1.0.0
```

### API Configuration
- Base URL: `http://localhost:8000/api`
- Authentication: Bearer Token
- CORS: Enabled di backend Laravel

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── events/         # Event management
│   ├── participants/   # Participant management
│   └── certificates/   # Certificate components
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom hooks
├── layouts/            # Layout components
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── App.tsx            # Main app component
```

## 🚀 Available Scripts

```bash
# Development
npm start              # Start dev server
npm run build          # Build for production
npm run test           # Run tests
npm run eject          # Eject from CRA

# Code Quality
npm run lint           # ESLint
npm run format         # Prettier
```

## 🔐 Authentication Flow

1. **Login** → JWT token disimpan di localStorage
2. **Route Protection** → Protected routes check authentication
3. **API Calls** → Token otomatis ditambahkan ke headers
4. **Token Expiry** → Auto redirect ke login jika expired
5. **Logout** → Clear token dan redirect ke login

## 📱 Responsive Design

- **Mobile First** - Design dimulai dari mobile
- **Breakpoints** - xs, sm, md, lg, xl
- **Flexible Grid** - Material-UI Grid system
- **Touch Friendly** - Touch targets yang sesuai

## 🎨 Theme & Styling

- **Material Design** - Google Material Design principles
- **Custom Theme** - Primary/secondary colors yang dapat disesuaikan
- **Dark Mode** - Support untuk dark theme (coming soon)
- **Typography** - Roboto font family
- **Spacing** - Consistent spacing system

## 📊 State Management

- **React Context** - Authentication state
- **React Query** - Server state management
- **Local State** - Component-level state
- **Form State** - React Hook Form

## 🔒 Security Features

- **JWT Tokens** - Secure authentication
- **Route Protection** - Protected routes
- **Input Validation** - Client-side validation
- **XSS Protection** - Built-in React protection
- **CSRF Protection** - Backend Laravel protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Build analysis
npm run build --analyze

# Deploy to hosting
# Copy build/ folder ke web server
```

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues** - GitHub Issues
- **Documentation** - README dan inline comments
- **Backend** - Laravel API documentation

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development
npm start

# Open browser
http://localhost:3000
```

## 📋 TODO

- [ ] Dark mode support
- [ ] Advanced search filters
- [ ] Real-time notifications
- [ ] Offline support
- [ ] PWA features
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility improvements

---

**Happy Coding! 🎉**
