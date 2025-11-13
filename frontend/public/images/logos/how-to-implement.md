# 🚀 Cara Implementasi Logo GOMOMENT

## 📋 Langkah-langkah Implementasi

### 1. 📁 Siapkan File Logo
Letakkan file logo Anda di folder:
```
/public/images/logos/
├── logo-gomoment.png          # Logo utama (dengan teks)
├── logo-gomoment-white.png    # Logo versi putih
├── logo-gomoment-icon.png     # Icon saja
└── logo-gomoment-horizontal.png # Logo horizontal
```

### 2. 🔄 Ganti Text Logo dengan Image Logo

#### A. Di PublicLayout.tsx (Header)
**Lokasi**: `src/layouts/PublicLayout.tsx` baris ~186-199

**SEBELUM:**
```tsx
<Typography variant="h5" sx={{ fontWeight: 800, ... }}>
  GOMOMENT
</Typography>
```

**SESUDAH:**
```tsx
<img 
  src="/images/logos/logo-gomoment.png" 
  alt="GOMOMENT"
  style={{
    height: scrolled ? '32px' : '40px',
    width: 'auto',
    transition: 'all 0.3s ease',
  }}
/>
```

#### B. Di AdminLayout.tsx (Sidebar)
**Lokasi**: `src/layouts/AdminLayout.tsx` baris ~187-188

**SEBELUM:**
```tsx
<Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
  GOMOMENT
</Typography>
```

**SESUDAH:**
```tsx
{!collapsed && (
  <img 
    src="/images/logos/logo-gomoment-white.png" 
    alt="GOMOMENT"
    style={{ height: '24px', width: 'auto' }}
  />
)}
```

#### C. Di OrganizerLayout.tsx (Sidebar)
**Lokasi**: `src/layouts/OrganizerLayout.tsx` baris ~198-199

**SESUDAH:**
```tsx
{!collapsed && (
  <img 
    src="/images/logos/logo-gomoment-white.png" 
    alt="GOMOMENT"
    style={{ height: '24px', width: 'auto' }}
  />
)}
```

#### D. Di Footer.tsx
**Lokasi**: `src/components/common/Footer.tsx` baris ~111-112

**SEBELUM:**
```tsx
<Typography variant="h4" component="h2" fontWeight="bold" sx={{ color: '#667eea' }}>
  GOMOMENT
</Typography>
```

**SESUDAH:**
```tsx
<img 
  src="/images/logos/logo-gomoment.png" 
  alt="GOMOMENT"
  style={{ height: '48px', width: 'auto' }}
/>
```

### 3. 🎨 Contoh Implementasi Responsive

```tsx
// Logo yang berubah berdasarkan ukuran layar
<Box sx={{ display: 'flex', alignItems: 'center' }}>
  <picture>
    {/* Mobile: hanya icon */}
    <source 
      media="(max-width: 768px)" 
      srcSet="/images/logos/logo-gomoment-icon.png"
    />
    {/* Desktop: logo full */}
    <img 
      src="/images/logos/logo-gomoment.png" 
      alt="GOMOMENT"
      style={{
        height: 'auto',
        maxHeight: '40px',
        width: 'auto',
        maxWidth: '200px'
      }}
    />
  </picture>
</Box>
```

### 4. 🌙 Dark Mode Support

```tsx
const Logo = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <img 
    src={isDarkMode 
      ? "/images/logos/logo-gomoment-white.png" 
      : "/images/logos/logo-gomoment.png"
    }
    alt="GOMOMENT"
    style={{ height: '40px', width: 'auto' }}
  />
);
```

### 5. 📱 Update Favicon & Meta Tags
Sudah diupdate di `public/index.html`:
- Favicon menggunakan logo icon
- Open Graph image untuk social media
- Theme color sesuai brand

## 🎯 Tips Implementasi

### ✅ DO:
- Gunakan format SVG untuk scalability terbaik
- Sediakan versi PNG sebagai fallback
- Buat variasi logo (white, dark, icon-only)
- Gunakan lazy loading untuk performa: `loading="lazy"`
- Set alt text yang descriptive

### ❌ DON'T:
- Jangan hardcode ukuran yang tidak responsive
- Jangan lupa fallback untuk browser lama
- Jangan gunakan logo yang terlalu besar (file size)

## 🔧 Testing

Setelah implementasi, test di:
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (responsive)
- [ ] Dark mode
- [ ] Slow connection (logo loading)
- [ ] Print preview

## 📊 Performance Tips

1. **Optimize Images:**
   - PNG: gunakan TinyPNG
   - SVG: minify dengan SVGO
   - WebP: untuk browser modern

2. **Preload Critical Logos:**
   ```html
   <link rel="preload" href="/images/logos/logo-gomoment.png" as="image">
   ```

3. **Use CSS untuk styling:**
   ```css
   .logo {
     height: 40px;
     width: auto;
     transition: all 0.3s ease;
   }
   ```
