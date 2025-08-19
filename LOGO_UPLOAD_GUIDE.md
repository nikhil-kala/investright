# 🖼️ Logo Upload Guide for InvestRight

## 📋 **Quick Start (Recommended)**

### **Step 1: Prepare Your Logo**
1. **Format**: Use PNG, SVG, or JPG format
2. **Size**: Recommended 200x200px or larger
3. **Background**: Transparent background preferred
4. **Quality**: High resolution for crisp display

### **Step 2: Upload Your Logo**
1. **Place logo file** in the `public/images/` folder
2. **Name it**: `logo.png`, `logo.svg`, or `logo.jpg`
3. **Restart the development server** if needed

### **Step 3: Your logo will automatically appear** in:
- Header (main navigation)
- Footer (if configured)
- Dashboard
- All authenticated pages

---

## 🔧 **Detailed Implementation**

### **Current Logo Location**
The logo is currently displayed in the Header component at:
```tsx
// src/components/Header.tsx - Line 35-38
<div className="bg-blue-700 p-2 rounded-lg">
  <TrendingUp className="h-6 w-6 text-white" />
</div>
```

### **Logo File Structure**
```
public/
└── images/
    ├── logo.png          # Main logo
    ├── logo-white.png    # White version for dark backgrounds
    ├── logo-dark.png     # Dark version for light backgrounds
    └── favicon.ico       # Browser tab icon
```

---

## 🎨 **Logo Customization Options**

### **Option 1: Simple Logo Replacement**
Replace the current icon with your logo image:

```tsx
// In src/components/Header.tsx
<div className="bg-blue-700 p-2 rounded-lg">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-6 w-6 object-contain"
  />
</div>
```

### **Option 2: Logo with Text**
Keep your logo and company name:

```tsx
// In src/components/Header.tsx
<div className="flex items-center space-x-2">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-8 w-8 object-contain"
  />
  <span className="text-2xl font-bold text-gray-900">
    Your Company Name
  </span>
</div>
```

### **Option 3: Responsive Logo**
Different logo sizes for different screen sizes:

```tsx
// In src/components/Header.tsx
<div className="flex items-center space-x-2">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-6 w-6 md:h-8 md:w-8 object-contain"
  />
  <span className="text-xl md:text-2xl font-bold text-gray-900">
    Your Company Name
  </span>
</div>
```

---

## 📱 **Logo Placement Locations**

### **1. Header (Main Navigation)**
- **File**: `src/components/Header.tsx`
- **Location**: Top left of every page
- **Current**: Blue icon with trending chart
- **Replace**: Your company logo

### **2. Footer (Optional)**
- **File**: `src/components/Footer.tsx`
- **Location**: Bottom of every page
- **Current**: Text-based footer
- **Add**: Your logo for brand consistency

### **3. Dashboard**
- **File**: `src/components/Dashboard.tsx`
- **Location**: Welcome section
- **Current**: Blue shield icon
- **Replace**: Your company logo

### **4. Login/Signup Pages**
- **File**: `src/components/Login.tsx` and `src/components/Signup.tsx`
- **Location**: Form headers
- **Current**: Blue user icon
- **Replace**: Your company logo

---

## 🎯 **Recommended Logo Specifications**

### **Main Logo**
- **Format**: PNG with transparency
- **Size**: 200x200px minimum
- **Colors**: Your brand colors
- **Style**: Professional, clean design

### **Favicon (Browser Tab)**
- **Format**: ICO or PNG
- **Size**: 16x16px, 32x32px, 48x48px
- **Location**: `public/favicon.ico`

### **Mobile Logo**
- **Format**: PNG or SVG
- **Size**: 100x100px for mobile
- **Optimization**: Compressed for fast loading

---

## 🚀 **Implementation Steps**

### **Step 1: Create Logo Files**
```bash
# Create images directory (if not exists)
mkdir -p public/images

# Place your logo files here:
# - public/images/logo.png
# - public/images/logo-white.png
# - public/images/logo-dark.png
# - public/favicon.ico
```

### **Step 2: Update Header Component**
Replace the current icon in `src/components/Header.tsx`:

```tsx
// Find this section (around line 35-38):
<div className="bg-blue-700 p-2 rounded-lg">
  <TrendingUp className="h-6 w-6 text-white" />
</div>

// Replace with:
<div className="bg-blue-700 p-2 rounded-lg">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-6 w-6 object-contain"
  />
</div>
```

### **Step 3: Update Other Components**
Apply similar changes to:
- `src/components/Dashboard.tsx`
- `src/components/Login.tsx`
- `src/components/Signup.tsx`
- `src/components/Footer.tsx` (optional)

### **Step 4: Test Your Changes**
1. **Save all files**
2. **Check browser** for logo display
3. **Test responsive design** on different screen sizes
4. **Verify logo quality** on high-DPI displays

---

## 🎨 **Advanced Customization**

### **Logo with Background**
```tsx
<div className="bg-white p-2 rounded-lg shadow-sm">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-8 w-8 object-contain"
  />
</div>
```

### **Logo with Hover Effects**
```tsx
<div className="bg-blue-700 p-2 rounded-lg transition-all duration-200 hover:bg-blue-800 hover:scale-105">
  <img 
    src="/images/logo.png" 
    alt="InvestRight Logo" 
    className="h-6 w-6 object-contain"
  />
</div>
```

### **Responsive Logo Sizing**
```tsx
<img 
  src="/images/logo.png" 
  alt="InvestRight Logo" 
  className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 object-contain"
/>
```

---

## 🔍 **Troubleshooting**

### **Logo Not Displaying**
1. **Check file path**: Ensure logo is in `public/images/`
2. **File permissions**: Make sure file is readable
3. **File format**: Use supported formats (PNG, JPG, SVG)
4. **Browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### **Logo Too Large/Small**
1. **Adjust CSS classes**: Modify `h-6 w-6` values
2. **Use responsive classes**: `h-6 w-6 md:h-8 md:w-8`
3. **Check object-fit**: Use `object-contain` for proper scaling

### **Logo Quality Issues**
1. **Use high-resolution images**: 2x or 3x the display size
2. **Optimize file size**: Compress without losing quality
3. **Use SVG format**: Scalable vector graphics for crisp display

---

## 📋 **Checklist**

- [ ] Logo file prepared (PNG/SVG/JPG)
- [ ] Logo placed in `public/images/` folder
- [ ] Header component updated
- [ ] Dashboard component updated
- [ ] Login/Signup components updated
- [ ] Footer component updated (optional)
- [ ] Favicon updated
- [ ] Responsive design tested
- [ ] Logo quality verified
- [ ] Brand consistency maintained

---

## 🎯 **Next Steps After Logo Upload**

1. **Update company name** in translations
2. **Customize color scheme** to match your brand
3. **Add company information** to About/Contact pages
4. **Update meta tags** for SEO
5. **Test on different devices** and browsers

---

## 💡 **Pro Tips**

- **Keep logo simple**: Clean, recognizable design works best
- **Use consistent sizing**: Same logo dimensions across components
- **Optimize for web**: Compress images for fast loading
- **Test accessibility**: Ensure logo has proper alt text
- **Maintain brand consistency**: Use same logo everywhere

---

**Need Help?** If you encounter any issues while uploading your logo, refer to the component files or contact the development team for assistance.

**Happy Branding! 🎨✨**
