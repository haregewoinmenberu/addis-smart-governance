# Favicon Setup Instructions

## Download the Logo

Download the official ITDB logo from:
```
https://aaitdb.gov.et/uploads/Setting/addis-ababa-city-administration-innovation-and-techenology-development-bureau-2026-03-26-69c4de59f1c4a.png
```

## Save as Favicon

1. Save the downloaded image as `favicon.png` in this directory (`public/`)
2. Optionally, convert to ICO format for better browser compatibility:
   - Use an online converter like https://convertio.co/png-ico/
   - Save as `favicon.ico` in this directory

## File Structure

After setup, you should have:
```
public/
├── favicon.png          (Required - PNG format)
└── favicon.ico          (Optional - ICO format for older browsers)
```

## Verification

The favicon is already configured in the application. Once you place the files, they will be automatically used:
- Modern browsers will use `favicon.png`
- Older browsers will fall back to `favicon.ico` if available

## Current Configuration

The favicon is referenced in `src/routes/__root.tsx`:
```typescript
links: [
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon.png",
  },
  {
    rel: "apple-touch-icon",
    href: "/favicon.png",
  },
]
```

## Manual Download Steps

If the URL doesn't work, you can:
1. Visit https://aaitdb.gov.et
2. Navigate to the settings or about section
3. Download the official ITDB logo
4. Save it as `favicon.png` in the `public/` directory
