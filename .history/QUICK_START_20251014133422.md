# 🚀 QUICK START - Map & Zone System

## 🟢 Servers Running

### Backend API (Port 3101)
```
Status: ✅ RUNNING
URL: http://127.0.0.1:3101
File: simple-login-server.js
```

### Frontend Vite (Port 5173)
```
Status: ✅ RUNNING  
URL: http://localhost:5173
```

---

## 📋 Available API Endpoints

### **Authentication**
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/health` - Check server health

### **Maps**
- `POST /api/map` - Create new map (returns map with code)
- `GET /api/map/:map_id` - Get specific map
- `PUT /api/map/:map_id` - Update map
- `GET /api/customer/:customer_id/maps` - Get all maps for customer (with zone counts)

### **Zones**
- `POST /api/zone` - Create zone for a map
- `GET /api/map/:map_id/zones` - Get all zones for a map
- `PUT /api/zone/:zone_id` - Update zone
- `DELETE /api/zone/:zone_id` - Delete zone

---

## 🎯 How to Use

### **1. Create a New Map**

```javascript
// Frontend automatically generates map code
const mapCode = `MAP-${Date.now()}-${randomString}`;

// POST /api/map
{
  "title": "My New Map",
  "description": "Description here",
  "map_code": mapCode,  // Auto-generated
  "customer_id": 18,
  "country": "Lebanon",
  "active": true
}

// Response includes map_id and map_code
{
  "success": true,
  "map": {
    "map_id": 13,
    "map_code": "MAP-1697280000-ABC123",
    ...
  }
}
```

### **2. Create Zones for the Map**

```javascript
// After map is created, save each zone
// POST /api/zone
{
  "map_id": 13,  // From step 1
  "name": "Zone 1",
  "color": "#ff0000",
  "coordinates": [[lat, lng], [lat, lng], ...],
  "customer_id": 18
}

// Response
{
  "success": true,
  "zone": {
    "id": "uuid-generated",
    "map_id": 13,
    "name": "Zone 1",
    ...
  }
}
```

### **3. View in Dashboard**

```javascript
// GET /api/customer/18/maps
// Returns all maps with zone counts

{
  "success": true,
  "maps": [
    {
      "map_id": 13,
      "title": "My New Map",
      "map_code": "MAP-1697280000-ABC123",
      "zone_count": "5",  // Number of zones
      "created_at": "..."
    }
  ]
}
```

---

## 📊 Database Relationships

```
customer (you@gmail.com)
    │
    ├─→ map #13 (code: MAP-...ABC123)
    │   ├─→ zone #1 (name: "Beirut")
    │   ├─→ zone #2 (name: "Tripoli")
    │   └─→ zone #3 (name: "Sidon")
    │
    └─→ map #14 (code: MAP-...XYZ789)
        ├─→ zone #1 (name: "Damascus")
        └─→ zone #2 (name: "Aleppo")
```

---

## 🔍 Key Features

✅ **Unique Map Codes**: Each map gets a unique code like `MAP-1697280000-ABC123`
✅ **Zone Tracking**: See how many zones each map has
✅ **Customer Ownership**: Each customer sees only their maps
✅ **Zone Management**: Create, update, delete zones
✅ **Real-time Updates**: Dashboard shows current zone counts

---

## 🎨 What You See in Browser

### Dashboard View:
```
╔════════════════════════════════════════════════════════╗
║ My Maps Dashboard                                      ║
║ 👤 Logged in as: eidimontaha20@gmail.com             ║
╠════════════════════════════════════════════════════════╣
║ 📊 Total Maps: 2  |  🏷️ Total Zones: 10  |  📈 Avg: 5.0 ║
╠════════════════════════════════════════════════════════╣
║ ID  │ Title  │ Map Code       │ Zones │ Date      │   ║
║ #13 │ Map A  │ MAP-...ABC123  │   5   │ 10/14/25  │   ║
║ #12 │ fff    │ MAP-...XYZ789  │   2   │ 10/13/25  │   ║
║ #10 │ map1   │ MAP-...DEF456  │   8   │ 10/13/25  │   ║
╚════════════════════════════════════════════════════════╝
```

### Map Editor:
- Shows map code at top
- Interactive map for drawing zones
- Save button to save all zones
- Each zone saved individually to database

---

## 🎯 Your Current Maps

Based on database query:

**Customer: eidimontaha20@gmail.com (ID: 18)**

- ✅ Map 10: "map1" → 8 zones
- ✅ Map 12: "fff" → 2 zones
- **Total: 2 maps, 10 zones**

---

## ⚡ Next Steps

1. **Refresh browser** at http://localhost:5173
2. **Login** if not already logged in
3. **View dashboard** - See your 2 existing maps with zone counts
4. **Create new map** - Click "Create New Map"
5. **Add zones** - Draw zones on the map
6. **Save** - Map code will be generated and displayed
7. **View in dashboard** - See new map with zone count

---

## 🐛 If Something Doesn't Work

1. **Check both servers are running:**
   ```powershell
   # Backend
   Get-Process node | Select-Object Id, ProcessName
   
   # Should see node processes
   ```

2. **Check browser console** (F12) for errors

3. **Check server logs** in terminal for API errors

4. **Verify database:**
   ```powershell
   node check-customer-maps.cjs
   ```

---

## 📞 Summary

**What's Working:**
- ✅ Backend API with all map/zone endpoints
- ✅ Frontend dashboard with zone counts  
- ✅ Map code generation
- ✅ Zone creation and management
- ✅ Customer-map relationships
- ✅ Database queries working

**What to Test:**
1. Login to dashboard
2. View existing maps (should see 2 maps)
3. Create new map → should generate code
4. Add zones → save to database
5. Return to dashboard → see updated counts

**Everything is ready! 🎉**
