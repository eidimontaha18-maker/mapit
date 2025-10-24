# MapIt Country & City Search Feature

This feature allows you to easily search for countries and view their cities on an interactive map.

## Getting Started

### Option 1: Using the Simple Server (Recommended)
```bash
# Start the simple server
npm run simple

# Then open in your browser:
# http://localhost:3001/country-city-search.html
```

### Option 2: Using the Start Script
```bash
# Install dependencies if not already done
npm install

# Start the server and open browser automatically
npm run start
```

## Features

- **Country Search**: Type a country name and view it on the map
- **Autocomplete**: Get country name suggestions as you type
- **City Selection**: Choose from available cities in the selected country
- **Interactive Map**: See markers for the selected locations
- **Coordinate Display**: View the exact latitude and longitude

## How to Use

1. Enter a country name in the search box
   - Use the autocomplete suggestions that appear
   - Click "Search Location" to find the country

2. Select a city from the dropdown menu
   - The dropdown will be populated with cities from the selected country
   - Selecting a city will zoom in on the map to that location

3. View location details
   - The map will show a marker at the selected location
   - Location information including coordinates will be displayed

## Troubleshooting

If you encounter any issues:

- Make sure the server is running on port 3001
- Check that your browser can access http://localhost:3001
- Try refreshing the page if the map or autocomplete doesn't load
- Check your browser console for any error messages

## Technical Details

- The application uses Leaflet.js for map display
- Stadia Maps provides the map tiles with English-only labels
- Country and city data is stored in JSON files
- No database connection is required for this feature
- Fully responsive design works on mobile and desktop