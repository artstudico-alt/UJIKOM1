# 🎨 GOMOMENT Assets Guide

## 📁 Struktur Folder

### `/logos/`
Tempat menyimpan semua variasi logo GOMOMENT:
- `logo-gomoment.png` - Logo utama (dengan teks)
- `logo-gomoment-white.png` - Logo versi putih (untuk background gelap)
- `logo-gomoment-icon.png` - Icon saja (tanpa teks)
- `logo-gomoment-horizontal.png` - Logo horizontal
- `logo-gomoment-vertical.png` - Logo vertikal

### `/branding/`
Asset branding dan marketing:
- `banner-main.jpg` - Banner utama website
- `og-image.png` - Open Graph image untuk social media
- `hero-background.jpg` - Background hero section

### `/events/`
Asset untuk event:
- `default-event.svg` - Default event image (sudah ada)
- `event-placeholder.png` - Placeholder untuk event tanpa gambar

## 🚀 Cara Penggunaan

### 1. Di React Components
```javascript
// Logo utama
<img src="/images/logos/logo-gomoment.png" alt="GOMOMENT" />

// Logo dengan responsive
<img 
  src="/images/logos/logo-gomoment.png" 
  alt="GOMOMENT"
  style={{ maxHeight: '40px', width: 'auto' }}
/>
```

### 2. Di CSS
```css
.header-logo {
  background-image: url('/images/logos/logo-gomoment.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### 3. Di HTML Meta Tags
```html
<meta property="og:image" content="/images/branding/og-image.png" />
<link rel="icon" href="/images/logos/logo-gomoment-icon.png" />
```

## 📏 Rekomendasi Ukuran

### Logo Utama:
- **Header**: 200x60px atau 300x90px
- **Footer**: 150x45px
- **Favicon**: 32x32px, 64x64px

### Banner:
- **Hero Section**: 1920x600px
- **Open Graph**: 1200x630px

## 🎨 Format File

- **Logo**: PNG dengan background transparan
- **Banner**: JPG untuk foto, PNG untuk grafis
- **Icon**: SVG untuk scalability, PNG untuk compatibility

## 📝 Naming Convention

- Gunakan kebab-case: `logo-gomoment-white.png`
- Sertakan variasi: `-white`, `-dark`, `-icon`, `-horizontal`
- Sertakan ukuran jika perlu: `-32x32`, `-large`
