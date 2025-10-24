# MapIt Country & City Search

This feature allows users to search for countries and view their cities on an interactive map.

## Features

- Search for any country and view its location on the map
- Autocomplete country name suggestions as you type
- Select from available cities in the selected country
- Interactive map with markers for selected locations
- Coordinates display for educational purposes

## How to Use

1. **Start the application:**
   ```
   npm install
   npm run start
   ```
   This will start the server and automatically open the country-city search page in your browser.

2. **Search for a Country:**
   - Type a country name in the input field
   - Use the autocomplete suggestions that appear
   - Click the "Search Location" button

3. **Select a City:**
   - After searching for a country, a dropdown with cities will appear
   - Select a city from the dropdown to view it on the map

4. **View Location Details:**
   - The map will display a marker for the selected location
   - Location information including coordinates will appear below the map

## Technical Details

- Maps powered by Leaflet.js with English-only labels
- Country and city data stored in JSON files
- Responsive design for use on various devices
- Server powered by Express.js

## Troubleshooting

If you encounter issues:

1. Make sure the server is running on port 3001
2. Check browser console for any JavaScript errors
3. Ensure the JSON data files are properly loaded
4. Try refreshing the page if autocomplete or map doesn't work