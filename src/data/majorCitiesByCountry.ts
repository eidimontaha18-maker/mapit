// Major cities for each country (used when API fails or for instant display)
export const MAJOR_CITIES_BY_COUNTRY: Record<string, Array<{name: string; lat: number; lng: number}>> = {
  // North America
  'United States': [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Boston', lat: 42.3601, lng: -71.0589 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', lat: 39.7392, lng: -104.9903 },
    { name: 'Washington', lat: 38.9072, lng: -77.0369 },
  ],
  
  'Canada': [
    { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
    { name: 'Calgary', lat: 51.0447, lng: -114.0719 },
    { name: 'Edmonton', lat: 53.5461, lng: -113.4938 },
    { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
    { name: 'Winnipeg', lat: 49.8951, lng: -97.1384 },
    { name: 'Quebec City', lat: 46.8139, lng: -71.2080 },
  ],
  
  'Mexico': [
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: 'Guadalajara', lat: 20.6597, lng: -103.3496 },
    { name: 'Monterrey', lat: 25.6866, lng: -100.3161 },
    { name: 'Puebla', lat: 19.0414, lng: -98.2063 },
    { name: 'Tijuana', lat: 32.5149, lng: -117.0382 },
    { name: 'Cancun', lat: 21.1619, lng: -86.8515 },
  ],
  
  // Europe
  'United Kingdom': [
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
    { name: 'Liverpool', lat: 53.4084, lng: -2.9916 },
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
    { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
    { name: 'Bristol', lat: 51.4545, lng: -2.5879 },
    { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
  ],
  
  'France': [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620 },
    { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  ],
  
  'Germany': [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'Munich', lat: 48.1351, lng: 11.5820 },
    { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    { name: 'Stuttgart', lat: 48.7758, lng: 9.1829 },
    { name: 'Dusseldorf', lat: 51.2277, lng: 6.7735 },
  ],
  
  'Italy': [
    { name: 'Rome', lat: 41.9028, lng: 12.4964 },
    { name: 'Milan', lat: 45.4642, lng: 9.1900 },
    { name: 'Naples', lat: 40.8518, lng: 14.2681 },
    { name: 'Turin', lat: 45.0703, lng: 7.6869 },
    { name: 'Florence', lat: 43.7696, lng: 11.2558 },
    { name: 'Venice', lat: 45.4408, lng: 12.3155 },
    { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
  ],
  
  'Spain': [
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    { name: 'Seville', lat: 37.3891, lng: -5.9845 },
    { name: 'Bilbao', lat: 43.2630, lng: -2.9350 },
    { name: 'Malaga', lat: 36.7213, lng: -4.4214 },
  ],
  
  'Netherlands': [
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Rotterdam', lat: 51.9225, lng: 4.47917 },
    { name: 'The Hague', lat: 52.0705, lng: 4.3007 },
    { name: 'Utrecht', lat: 52.0907, lng: 5.1214 },
  ],
  
  'Belgium': [
    { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
    { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
    { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
    { name: 'Bruges', lat: 51.2093, lng: 3.2247 },
  ],
  
  'Switzerland': [
    { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
    { name: 'Basel', lat: 47.5596, lng: 7.5886 },
    { name: 'Bern', lat: 46.9480, lng: 7.4474 },
  ],
  
  'Austria': [
    { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
    { name: 'Salzburg', lat: 47.8095, lng: 13.0550 },
    { name: 'Innsbruck', lat: 47.2692, lng: 11.4041 },
  ],
  
  'Poland': [
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
    { name: 'Krakow', lat: 50.0647, lng: 19.9450 },
    { name: 'Gdansk', lat: 54.3520, lng: 18.6466 },
    { name: 'Wroclaw', lat: 51.1079, lng: 17.0385 },
  ],
  
  'Greece': [
    { name: 'Athens', lat: 37.9838, lng: 23.7275 },
    { name: 'Thessaloniki', lat: 40.6401, lng: 22.9444 },
    { name: 'Patras', lat: 38.2466, lng: 21.7346 },
  ],
  
  'Portugal': [
    { name: 'Lisbon', lat: 38.7223, lng: -9.1393 },
    { name: 'Porto', lat: 41.1579, lng: -8.6291 },
    { name: 'Faro', lat: 37.0194, lng: -7.9322 },
  ],
  
  'Sweden': [
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
    { name: 'Gothenburg', lat: 57.7089, lng: 11.9746 },
    { name: 'Malmo', lat: 55.6050, lng: 13.0038 },
  ],
  
  'Norway': [
    { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
    { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
    { name: 'Trondheim', lat: 63.4305, lng: 10.3951 },
  ],
  
  'Denmark': [
    { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
    { name: 'Aarhus', lat: 56.1629, lng: 10.2039 },
    { name: 'Odense', lat: 55.4038, lng: 10.4024 },
  ],
  
  'Finland': [
    { name: 'Helsinki', lat: 60.1699, lng: 24.9384 },
    { name: 'Tampere', lat: 61.4978, lng: 23.7610 },
    { name: 'Turku', lat: 60.4518, lng: 22.2666 },
  ],
  
  'Ireland': [
    { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
    { name: 'Cork', lat: 51.8985, lng: -8.4756 },
    { name: 'Galway', lat: 53.2707, lng: -9.0568 },
  ],
  
  'Czech Republic': [
    { name: 'Prague', lat: 50.0755, lng: 14.4378 },
    { name: 'Brno', lat: 49.1951, lng: 16.6068 },
  ],
  
  'Hungary': [
    { name: 'Budapest', lat: 47.4979, lng: 19.0402 },
    { name: 'Debrecen', lat: 47.5316, lng: 21.6273 },
  ],
  
  'Romania': [
    { name: 'Bucharest', lat: 44.4268, lng: 26.1025 },
    { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
  ],
  
  // Asia
  'India': [
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  ],
  
  'China': [
    { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
    { name: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
    { name: 'Chengdu', lat: 30.5728, lng: 104.0668 },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  ],
  
  'Japan': [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
    { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
    { name: 'Yokohama', lat: 35.4437, lng: 139.6380 },
    { name: 'Nagoya', lat: 35.1815, lng: 136.9066 },
  ],
  
  'South Korea': [
    { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
    { name: 'Busan', lat: 35.1796, lng: 129.0756 },
    { name: 'Incheon', lat: 37.4563, lng: 126.7052 },
  ],
  
  'Thailand': [
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
    { name: 'Chiang Mai', lat: 18.7883, lng: 98.9853 },
    { name: 'Phuket', lat: 7.8804, lng: 98.3923 },
  ],
  
  'Vietnam': [
    { name: 'Hanoi', lat: 21.0285, lng: 105.8542 },
    { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
    { name: 'Da Nang', lat: 16.0544, lng: 108.2022 },
  ],
  
  'Malaysia': [
    { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    { name: 'Penang', lat: 5.4164, lng: 100.3327 },
  ],
  
  'Singapore': [
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  ],
  
  'Indonesia': [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { name: 'Bali', lat: -8.4095, lng: 115.1889 },
  ],
  
  'Philippines': [
    { name: 'Manila', lat: 14.5995, lng: 120.9842 },
    { name: 'Cebu City', lat: 10.3157, lng: 123.8854 },
  ],
  
  'Turkey': [
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { name: 'Izmir', lat: 38.4237, lng: 27.1428 },
  ],
  
  'Israel': [
    { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
    { name: 'Jerusalem', lat: 31.7683, lng: 35.2137 },
    { name: 'Haifa', lat: 32.7940, lng: 34.9896 },
  ],
  
  'Saudi Arabia': [
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { name: 'Jeddah', lat: 21.4858, lng: 39.1925 },
    { name: 'Mecca', lat: 21.3891, lng: 39.8579 },
  ],
  
  'United Arab Emirates': [
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
    { name: 'Sharjah', lat: 25.3463, lng: 55.4209 },
    { name: 'Ajman', lat: 25.4052, lng: 55.5136 },
    { name: 'Ras Al Khaimah', lat: 25.7889, lng: 55.9433 },
    { name: 'Fujairah', lat: 25.1288, lng: 56.3265 },
    { name: 'Umm Al Quwain', lat: 25.5647, lng: 55.5552 },
    { name: 'Al Ain', lat: 24.2075, lng: 55.7447 },
  ],
  
  'Qatar': [
    { name: 'Doha', lat: 25.2854, lng: 51.5310 },
  ],
  
  'Kuwait': [
    { name: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
  ],
  
  'Lebanon': [
    { name: 'Beirut', lat: 33.8938, lng: 35.5018 },
    { name: 'Tripoli', lat: 34.4333, lng: 35.8333 },
    { name: 'Sidon', lat: 33.5633, lng: 35.3781 },
    { name: 'Tyre', lat: 33.2704, lng: 35.2038 },
    { name: 'Byblos', lat: 34.1211, lng: 35.6481 },
  ],
  
  'Jordan': [
    { name: 'Amman', lat: 31.9454, lng: 35.9284 },
    { name: 'Petra', lat: 30.3285, lng: 35.4444 },
  ],
  
  'Syria': [
    { name: 'Damascus', lat: 33.5138, lng: 36.2765 },
    { name: 'Aleppo', lat: 36.2021, lng: 37.1343 },
    { name: 'Homs', lat: 34.7333, lng: 36.7167 },
    { name: 'Latakia', lat: 35.5169, lng: 35.7834 },
    { name: 'Hama', lat: 35.1333, lng: 36.7500 },
    { name: 'Tartus', lat: 34.8833, lng: 35.8833 },
    { name: 'Deir ez-Zor', lat: 35.3333, lng: 40.1500 },
    { name: 'Raqqa', lat: 35.9500, lng: 39.0167 },
    { name: 'Idlib', lat: 35.9294, lng: 36.6331 },
    { name: 'Daraa', lat: 32.6189, lng: 36.1021 },
  ],
  
  // Africa
  'Egypt': [
    { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
    { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
    { name: 'Giza', lat: 30.0131, lng: 31.2089 },
  ],
  
  'South Africa': [
    { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
    { name: 'Durban', lat: -29.8587, lng: 31.0218 },
    { name: 'Pretoria', lat: -25.7479, lng: 28.2293 },
  ],
  
  'Nigeria': [
    { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
    { name: 'Abuja', lat: 9.0765, lng: 7.3986 },
    { name: 'Kano', lat: 12.0022, lng: 8.5920 },
  ],
  
  'Kenya': [
    { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
    { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
  ],
  
  'Morocco': [
    { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
    { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
    { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  ],
  
  'Ethiopia': [
    { name: 'Addis Ababa', lat: 9.0320, lng: 38.7469 },
  ],
  
  'Ghana': [
    { name: 'Accra', lat: 5.6037, lng: -0.1870 },
  ],
  
  // South America
  'Brazil': [
    { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    { name: 'Brasilia', lat: -15.8267, lng: -47.9218 },
    { name: 'Salvador', lat: -12.9714, lng: -38.5014 },
  ],
  
  'Argentina': [
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
    { name: 'Cordoba', lat: -31.4201, lng: -64.1888 },
    { name: 'Rosario', lat: -32.9468, lng: -60.6393 },
  ],
  
  'Chile': [
    { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
    { name: 'Valparaiso', lat: -33.0472, lng: -71.6127 },
  ],
  
  'Colombia': [
    { name: 'Bogota', lat: 4.7110, lng: -74.0721 },
    { name: 'Medellin', lat: 6.2476, lng: -75.5658 },
    { name: 'Cali', lat: 3.4516, lng: -76.5320 },
  ],
  
  'Peru': [
    { name: 'Lima', lat: -12.0464, lng: -77.0428 },
    { name: 'Cusco', lat: -13.5319, lng: -71.9675 },
  ],
  
  'Venezuela': [
    { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
  ],
  
  // Oceania
  'Australia': [
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
    { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
    { name: 'Perth', lat: -31.9505, lng: 115.8605 },
    { name: 'Adelaide', lat: -34.9285, lng: 138.6007 },
  ],
  
  'New Zealand': [
    { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
    { name: 'Wellington', lat: -41.2865, lng: 174.7762 },
    { name: 'Christchurch', lat: -43.5321, lng: 172.6362 },
  ],
  
  // Russia
  'Russia': [
    { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
    { name: 'Saint Petersburg', lat: 59.9343, lng: 30.3351 },
    { name: 'Novosibirsk', lat: 55.0084, lng: 82.9357 },
    { name: 'Yekaterinburg', lat: 56.8389, lng: 60.6057 },
  ],
};
