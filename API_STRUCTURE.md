# API Endpoints - Consolidated Structure

## ✅ Fixed: Vercel Hobby Plan Compatible (7/12 Functions)

The APIs have been reorganized to fit within Vercel's Hobby plan limit of 12 serverless functions.

---

## 📋 API Files (7 Total)

### 1. `/api/login.js` - Customer Login
- **POST** `/api/login` - Customer authentication

### 2. `/api/register.js` - Customer Registration  
- **POST** `/api/register` - Register new customer

### 3. `/api/packages.js` - Packages List
- **GET** `/api/packages` - Get all packages

### 4. `/api/admin/[...path].js` - All Admin Endpoints
Routes handled:
- **POST** `/api/admin/login` - Admin authentication
- **GET** `/api/admin/stats` - Dashboard statistics
- **GET** `/api/admin/maps` - All maps (admin view)
- **GET** `/api/admin/orders` - All orders (admin view)

### 5. `/api/customer/[...path].js` - All Customer Endpoints
Routes handled:
- **GET** `/api/customer/maps` - Get all customer maps
- **GET** `/api/customer/[id]/maps` - Get specific customer's maps
- **GET** `/api/customer/[id]/package` - Get customer's package info

### 6. `/api/map/[id].js` - All Map Operations
Routes handled:
- **GET** `/api/map` - List all maps
- **POST** `/api/map` - Create new map
- **GET** `/api/map/[id]` - Get specific map with zones
- **PUT** `/api/map/[id]` - Update map
- **DELETE** `/api/map/[id]` - Delete map (cascade zones)

### 7. `/api/zones/[...path].js` - All Zone Operations
Routes handled:
- **GET** `/api/zones?map_id=[id]` - Get zones for a map
- **POST** `/api/zones` - Create new zone
- **GET** `/api/zones/[id]` - Get specific zone
- **PUT** `/api/zones/[id]` - Update zone
- **DELETE** `/api/zones/[id]` - Delete zone
- **POST** `/api/zones/bulk` - Bulk save zones

---

## 🔄 Migration from Previous Structure

### What Changed?
- **Before**: 17 separate API files (exceeded limit)
- **After**: 7 consolidated API files using catch-all routes

### Catch-All Routes (`[...path]`)
Vercel supports dynamic catch-all routes:
- `[...path].js` captures multiple path segments
- Route logic inside the file determines the action
- Example: `/api/admin/stats` → handled by `/api/admin/[...path].js`

### No Frontend Changes Needed
All existing API calls work exactly the same:
```javascript
// These all still work
fetch('/api/admin/login', { method: 'POST', ... })
fetch('/api/customer/1/maps')
fetch('/api/zones?map_id=5')
fetch('/api/map/3', { method: 'PUT', ... })
```

---

## 📊 Function Count Breakdown

| Function | Routes Handled |
|----------|----------------|
| login.js | 1 route |
| register.js | 1 route |
| packages.js | 1 route |
| admin/[...path].js | 4 routes (login, stats, maps, orders) |
| customer/[...path].js | 3 routes (maps, [id]/maps, [id]/package) |
| map/[id].js | 5 routes (list, create, get, update, delete) |
| zones/[...path].js | 6 routes (list, create, get, update, delete, bulk) |
| **TOTAL** | **7 functions, 21 routes** |

---

## ✅ Benefits

1. **Vercel Compatible**: 7 functions < 12 limit ✓
2. **Same Functionality**: All 21 endpoints still work ✓
3. **No Breaking Changes**: Frontend code unchanged ✓
4. **Better Organization**: Related endpoints grouped together ✓
5. **Easy to Maintain**: Fewer files to manage ✓

---

## 🚀 Deployment Status

✅ **Deployed to Vercel** - All APIs working on hosted site
✅ **Database Connected** - Neon PostgreSQL
✅ **CRUD Operations** - Fetch, Add, Update, Delete all functional
✅ **Local & Hosted** - Same code, same behavior

---

## 📝 Example Usage

### Admin Login
```javascript
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@mapit.com', 
    password: '123456' 
  })
});
```

### Get Customer Maps
```javascript
const response = await fetch('/api/customer/1/maps');
const data = await response.json();
console.log(data.maps);
```

### Save Zones
```javascript
const response = await fetch('/api/zones/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    zones: [
      { id: 'temp-1', map_id: 5, name: 'Zone 1', color: '#ff0000', coordinates: [...] }
    ]
  })
});
```

### Update Map
```javascript
const response = await fetch('/api/map/3', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    title: 'Updated Title',
    country: 'Lebanon',
    active: true
  })
});
```

---

## 🎉 Result

Your MapIt project now deploys successfully to Vercel with full database functionality!
