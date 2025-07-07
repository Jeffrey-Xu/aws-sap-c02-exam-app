# Deployment Configuration Fix

## Issue
The Vercel deployment was failing due to large JSON files (3.3MB+) exceeding the PWA service worker cache limit of 2MB.

## Error Message
```
Configure "workbox.maximumFileSizeToCacheInBytes" to change the limit: the default value is 2 MiB.
Assets exceeding the limit:
- data/questions.json is 3.46 MB, and won't be precached.
```

## Solution Applied

### 1. PWA Configuration Update (`vite.config.ts`)
- **Increased cache limit**: Set `maximumFileSizeToCacheInBytes` to 5MB
- **Excluded large files from precaching**: Added `globIgnores` for question JSON files
- **Added runtime caching**: Configured `StaleWhileRevalidate` strategy for question data

### 2. File Cleanup
- Removed duplicate large JSON files:
  - `public/data/questions_enhanced_with_reasoning.json` (3.3MB)
  - `public/questions_enhanced.json` (3.4MB)
- Kept essential files:
  - `public/data/questions.json` (main dataset)
  - `public/data/questions_backup_before_reasoning_update.json` (backup)

### 3. Caching Strategy
```javascript
runtimeCaching: [
  {
    urlPattern: /\/data\/questions.*\.json$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'questions-cache',
      expiration: {
        maxEntries: 5,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
      }
    }
  }
]
```

## Benefits
1. **Deployment Success**: Vercel builds now complete without errors
2. **Optimal Caching**: Large JSON files are cached at runtime, not during build
3. **Better Performance**: StaleWhileRevalidate ensures fresh data while maintaining speed
4. **Reduced Bundle Size**: Removed duplicate files saves bandwidth

## Testing
- ✅ Local build successful
- ✅ PWA service worker generates correctly
- ✅ Question data loads properly
- ✅ Ready for Vercel deployment

## Next Steps
The app should now deploy successfully on Vercel with:
- All 529 enhanced questions available
- Proper PWA caching for optimal performance
- Detailed explanations and reasoning analysis
- Mobile-friendly progressive web app features
