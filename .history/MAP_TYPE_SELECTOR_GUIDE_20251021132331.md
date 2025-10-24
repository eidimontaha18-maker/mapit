# Map Type Selector Feature

## Overview
The Map Type Selector allows customers to choose from different map visualization styles while preserving all drawn zones. This feature provides a Google Maps-style interface with five distinct map types.

## Available Map Types

### 1. **HYBRID** 🗺️
- **Description**: Satellite imagery with road and label overlays
- **Best For**: Getting detailed aerial views while still seeing street names and landmarks
- **Use Case**: Property boundaries, urban planning, detailed location identification

### 2. **ROAD** 🛣️
- **Description**: Traditional street map with roads, labels, and POIs
- **Best For**: Navigation and general map viewing
- **Use Case**: Delivery routes, general area mapping, street-level details

### 3. **SATELLITE** 🛰️
- **Description**: Pure aerial/satellite imagery without labels
- **Best For**: Viewing actual ground conditions and terrain features
- **Use Case**: Agricultural areas, natural landscapes, building identification

### 4. **TERRAIN** ⛰️
- **Description**: Topographic map showing elevation and terrain features
- **Best For**: Understanding elevation changes and landscape features
- **Use Case**: Hiking routes, land development, geographical analysis

### 5. **TRAFFIC** 🚦
- **Description**: Road map optimized for traffic information (note: real-time traffic requires additional API)
- **Best For**: Understanding road networks and planning routes
- **Use Case**: Delivery planning, traffic route optimization

## Features

### ✅ Zone Persistence
- **All drawn zones remain visible** when switching between map types
- Zone colors, names, and boundaries are preserved
- No data loss when changing map views

### ✅ Visual Selector Interface
- Thumbnail previews for each map type
- Clear labels and icons
- Active map type is highlighted with a checkmark
- Expandable/collapsible panel to save screen space

### ✅ Responsive Design
- Works on desktop and mobile devices
- Adapts to different screen sizes
- Touch-friendly interface

## How to Use

### Accessing the Map Type Selector
1. Look for the map type button in the **top-right corner** of the map
2. The button shows the currently selected map type (e.g., "ROAD")
3. Click the button to expand the map type selector panel

### Changing Map Types
1. Click on any map type thumbnail in the expanded panel
2. The map will immediately switch to the selected type
3. All your drawn zones will remain exactly where they are
4. The panel will collapse automatically after selection

### Drawing Zones on Different Map Types
1. You can draw zones on any map type
2. Switch to a different map type to verify zone placement
3. Use SATELLITE or HYBRID view for precise boundary drawing
4. Switch to ROAD view for street-based reference
5. Use TERRAIN view for elevation-aware zone planning

## Technical Implementation

### Component Architecture
```
WorldMap.tsx
├── MapTypeSelector.tsx (UI Component)
│   ├── Collapsed State: Shows current map type
│   └── Expanded State: Shows all map type options
├── TileLayer (React-Leaflet)
│   ├── Conditional rendering based on map type
│   └── Special handling for Hybrid (dual layers)
└── ZonesDisplay (Memoized Component)
    └── Independent of map type state
```

### Tile Providers
- **Road**: OpenStreetMap Standard Tiles
- **Satellite**: Esri World Imagery
- **Hybrid**: Esri Satellite + OSM Labels
- **Terrain**: OpenTopoMap
- **Traffic**: OpenStreetMap (base for traffic overlay)

### State Management
```typescript
const [currentMapType, setCurrentMapType] = useState<'road' | 'satellite' | 'hybrid' | 'terrain' | 'traffic'>('road');
```

The map type state is completely separate from zone data, ensuring zones persist across map type changes.

## Best Practices

### For Zone Drawing
1. **Start with HYBRID or SATELLITE** for accurate boundary identification
2. **Switch to ROAD** to verify street names and addresses
3. **Use TERRAIN** for properties with significant elevation changes
4. **Confirm zones on multiple map types** before finalizing

### For Map Navigation
- Different map types may have different zoom level capabilities
- Some map types load faster than others (Road is typically fastest)
- Satellite imagery may be outdated in some areas

### Performance Tips
- Zones are rendered efficiently using React.memo
- Map tiles are cached by the browser
- Switching map types is instantaneous (no data reload)

## Keyboard Shortcuts
Currently, map type changes are mouse/touch only. Future updates may include:
- `M` - Open map type selector
- `1-5` - Quick switch to specific map types
- `Tab` - Cycle through map types

## Known Limitations

1. **Traffic Data**: The Traffic map type shows the road network but does not include real-time traffic data. To add live traffic, you would need:
   - Google Maps Traffic API integration
   - HERE Maps Traffic API
   - TomTom Traffic Flow API

2. **Satellite Image Updates**: Satellite imagery may be outdated (typically 1-3 years old depending on location)

3. **Terrain Detail**: Terrain map detail varies by region and zoom level

## Future Enhancements

- [ ] Add real-time traffic overlay integration
- [ ] 3D terrain view option
- [ ] Custom map style editor
- [ ] Night mode/dark theme maps
- [ ] Offline map type caching
- [ ] Map type preferences saved per user
- [ ] Quick-switch keyboard shortcuts

## Support

For issues or feature requests related to map types:
1. Check that zones are visible on all map types
2. Verify map tiles are loading (check browser console)
3. Try switching between map types multiple times
4. Clear browser cache if map tiles appear broken

## Code Examples

### Adding a New Map Type
```typescript
// 1. Add to TILE_LAYERS in WorldMap.tsx
const TILE_LAYERS = {
  // ... existing types
  customType: {
    url: 'https://your-tile-provider.com/{z}/{x}/{y}.png',
    attribution: '© Your Provider',
    maxZoom: 18
  }
};

// 2. Update type definition
type MapType = 'road' | 'satellite' | 'hybrid' | 'terrain' | 'traffic' | 'customType';

// 3. Add to MapTypeSelector.tsx mapTypes array
{
  id: 'customType' as const,
  name: 'CUSTOM',
  icon: '🎨',
  description: 'Your custom map',
  preview: 'linear-gradient(135deg, #color1, #color2)'
}
```

### Checking Current Map Type
```typescript
// In any child component
const currentType = currentMapType; // 'road' | 'satellite' | etc.
```

## Changelog

### Version 1.0.0 (Current)
- ✅ Initial implementation with 5 map types
- ✅ Visual selector with thumbnails
- ✅ Zone persistence across map types
- ✅ Responsive design
- ✅ Hybrid map with dual layers

---

**Last Updated**: October 21, 2025
**Author**: GitHub Copilot
**Component Location**: `src/components/MapTypeSelector.tsx`
