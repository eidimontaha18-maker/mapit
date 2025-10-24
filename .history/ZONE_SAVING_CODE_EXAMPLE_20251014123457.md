# Zone Saving Code Example

## How Zones Are Automatically Saved to Database

### Example Scenario

You create a map titled "Lebanon Sales Territory" and draw 3 zones:
1. North Region (Blue - #3b82f6)
2. Central Region (Red - #ef4444)  
3. South Region (Green - #22c55e)

### Step 1: Zones Are Created on Map

When you draw zones, they're stored temporarily:

```typescript
// Each zone has this structure
const zone = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // UUID
  name: "North Region",
  color: "#3b82f6",
  coordinates: [
    [33.8547, 35.8623],
    [34.1234, 35.9876],
    [33.9876, 36.1234],
    // ... more coordinates forming the polygon
  ]
}
```

These zones go into the `pendingZones` array:

```typescript
pendingZones = [
  { id: "...", name: "North Region", color: "#3b82f6", coordinates: [...] },
  { id: "...", name: "Central Region", color: "#ef4444", coordinates: [...] },
  { id: "...", name: "South Region", color: "#22c55e", coordinates: [...] }
]
```

### Step 2: User Clicks "Save Map & 3 Zone(s)"

The save process begins:

```typescript
const handleSave = async () => {
  // 1. Generate map code
  const mapCode = "MAP-L4B2-9K7M";
  
  // 2. Save map to database
  const mapData = {
    title: "Lebanon Sales Territory",
    description: "Sales territories for Lebanon region",
    map_code: mapCode,
    customer_id: 5,
    map_data: { lat: 33.8547, lng: 35.8623, zoom: 8 }
  };
  
  const mapResponse = await fetch('/api/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapData)
  });
  
  const mapResult = await mapResponse.json();
  // mapResult.record.map_id = 42
  
  // 3. Save all zones to database
  await savePendingZones(42, 5);
}
```

### Step 3: Zones Are Saved to Database

```typescript
const savePendingZones = async (mapId: number, customerId: number) => {
  let successCount = 0;
  
  for (const zone of pendingZones) {
    // Each zone is saved individually
    const zoneData = {
      id: zone.id,                    // UUID from frontend
      map_id: mapId,                  // Link to created map
      customer_id: customerId,        // Owner of the zone
      name: zone.name,                // Zone name
      color: zone.color,              // Display color
      coordinates: zone.coordinates   // GeoJSON coordinates
    };
    
    const response = await fetch('/api/db/tables/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneData)
    });
    
    const result = await response.json();
    if (result.success) {
      successCount++;
      console.log(`✅ Zone "${zone.name}" saved`);
    }
  }
  
  return { success: successCount === pendingZones.length, count: successCount };
}
```

### Step 4: Database Records Created

#### MAP Table
```sql
INSERT INTO map (
  map_id, 
  title, 
  description, 
  map_code, 
  customer_id,
  map_data,
  created_at
) VALUES (
  42,
  'Lebanon Sales Territory',
  'Sales territories for Lebanon region',
  'MAP-L4B2-9K7M',
  5,
  '{"lat": 33.8547, "lng": 35.8623, "zoom": 8}',
  '2025-10-14 09:30:00'
);
```

#### ZONES Table
```sql
-- Zone 1: North Region
INSERT INTO zones (
  id, 
  map_id, 
  customer_id, 
  name, 
  color, 
  coordinates,
  created_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  42,
  5,
  'North Region',
  '#3b82f6',
  '[[33.8547,35.8623],[34.1234,35.9876],[33.9876,36.1234]]',
  '2025-10-14 09:30:01'
);

-- Zone 2: Central Region  
INSERT INTO zones (
  id, 
  map_id, 
  customer_id, 
  name, 
  color, 
  coordinates,
  created_at
) VALUES (
  'd4e5f6g7-h8i9-0j1k-2l3m-4n5678901234',
  42,
  5,
  'Central Region',
  '#ef4444',
  '[[33.5432,35.6789],[33.7654,35.8901],[33.6789,36.0123]]',
  '2025-10-14 09:30:02'
);

-- Zone 3: South Region
INSERT INTO zones (
  id, 
  map_id, 
  customer_id, 
  name, 
  color, 
  coordinates,
  created_at
) VALUES (
  'g7h8i9j0-k1l2-3m4n-5o6p-7q8901234567',
  42,
  5,
  'South Region',
  '#22c55e',
  '[[33.2345,35.4567],[33.4567,35.5678],[33.3456,35.6789]]',
  '2025-10-14 09:30:03'
);
```

### Step 5: Success Message Displayed

```typescript
// Success message is shown
setError(
  `Map saved successfully! Code: MAP-L4B2-9K7M | 3 zone(s) saved to database`
);

// After 2 seconds, redirect to dashboard
setTimeout(() => {
  navigate('/dashboard');
}, 2000);
```

## Backend API Endpoint (server.js)

### Map Creation Endpoint

```javascript
app.post('/api/map', async (req, res) => {
  const { title, description, map_code, customer_id, map_data } = req.body;
  
  const insertSql = `
    INSERT INTO map (title, description, map_data, map_code, customer_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING map_id
  `;
  
  const result = await pool.query(insertSql, [
    title,
    description,
    map_data,
    map_code,
    customer_id
  ]);
  
  res.status(201).json({
    success: true,
    record: {
      map_id: result.rows[0].map_id,
      map_code: map_code
    }
  });
});
```

### Zone Creation Endpoint (routes/db-routes.js)

```javascript
router.post('/tables/zones', async (req, res) => {
  const { id, map_id, customer_id, name, color, coordinates } = req.body;
  
  try {
    const query = `
      INSERT INTO zones (id, map_id, customer_id, name, color, coordinates)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      map_id,
      customer_id,
      name,
      color,
      JSON.stringify(coordinates)
    ]);
    
    res.status(201).json({
      success: true,
      record: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Data Flow Diagram

```
┌──────────────┐
│   User       │
│   Draws      │
│   Zones      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  pendingZones[]  │  ← Stored in React State
│  [Zone1, Zone2,  │
│   Zone3]         │
└──────┬───────────┘
       │
       ▼ Click "Save Map"
┌──────────────────┐
│  Generate Code   │  → MAP-L4B2-9K7M
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  POST /api/map   │  → Creates map record
└──────┬───────────┘
       │
       ▼ Returns map_id: 42
┌──────────────────────┐
│  savePendingZones()  │
└──────┬───────────────┘
       │
       ├─► POST /api/db/tables/zones (Zone 1)
       │   ✅ Success
       │
       ├─► POST /api/db/tables/zones (Zone 2)
       │   ✅ Success
       │
       └─► POST /api/db/tables/zones (Zone 3)
           ✅ Success
       
┌──────────────────┐
│  Database        │
│  ┌────────────┐  │
│  │ MAP Table  │  │  ← 1 record added
│  └────────────┘  │
│  ┌────────────┐  │
│  │ZONES Table │  │  ← 3 records added
│  └────────────┘  │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Success Message │
│  "Map saved!     │
│   Code: MAP-...  │
│   3 zones saved" │
└──────────────────┘
       │
       ▼ Wait 2 seconds
┌──────────────────┐
│  Redirect to     │
│  Dashboard       │
└──────────────────┘
```

## Query to Retrieve Map and Zones

```sql
-- Get map with all its zones
SELECT 
  m.map_id,
  m.title,
  m.description,
  m.map_code,
  m.created_at as map_created_at,
  z.id as zone_id,
  z.name as zone_name,
  z.color as zone_color,
  z.coordinates as zone_coordinates,
  z.created_at as zone_created_at
FROM map m
LEFT JOIN zones z ON m.map_id = z.map_id
WHERE m.map_code = 'MAP-L4B2-9K7M'
AND m.customer_id = 5
ORDER BY z.created_at;
```

Result:
```
map_id | title                    | map_code      | zone_name      | zone_color
-------|--------------------------|---------------|----------------|------------
42     | Lebanon Sales Territory  | MAP-L4B2-9K7M | North Region   | #3b82f6
42     | Lebanon Sales Territory  | MAP-L4B2-9K7M | Central Region | #ef4444
42     | Lebanon Sales Territory  | MAP-L4B2-9K7M | South Region   | #22c55e
```

## Error Handling Example

```typescript
const savePendingZones = async (mapId: number, customerId: number) => {
  const results = {
    total: pendingZones.length,
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const zone of pendingZones) {
    try {
      const response = await fetch('/api/db/tables/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: zone.id,
          map_id: mapId,
          customer_id: customerId,
          name: zone.name,
          color: zone.color,
          coordinates: zone.coordinates
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        results.success++;
        console.log(`✅ Zone "${zone.name}" saved successfully`);
      } else {
        results.failed++;
        results.errors.push({ zone: zone.name, error: result.error });
        console.error(`❌ Failed to save zone "${zone.name}":`, result.error);
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ zone: zone.name, error: err.message });
      console.error(`❌ Error saving zone "${zone.name}":`, err);
    }
  }
  
  return results;
}
```

## Testing the Feature

### Manual Test Steps

1. **Start servers**
   ```bash
   node server.js      # Backend on port 3101
   npm run dev         # Frontend on port 5173/5174
   ```

2. **Create a map**
   - Navigate to http://localhost:5173
   - Login with test account
   - Click "Create New Map"
   - Enter title: "Test Map"
   - Note the generated map code

3. **Draw zones**
   - Click on map to create polygons
   - Create 2-3 test zones
   - Observe zones appearing in "Created Zones" list
   - Check they show "Pending" status

4. **Save map**
   - Click "Save Map & X Zone(s)" button
   - Watch button change to loading state
   - Wait for success message
   - Verify zone count matches

5. **Verify in database**
   ```sql
   -- Check map was created
   SELECT * FROM map WHERE map_code = 'MAP-XXXX-XXXX';
   
   -- Check zones were saved
   SELECT * FROM zones WHERE map_id = [returned_map_id];
   ```

### Expected Results

✅ Map code generated immediately  
✅ Zones appear in list as drawn  
✅ Button shows zone count  
✅ Save operation completes successfully  
✅ Success message shows zone count  
✅ Redirect to dashboard after 2 seconds  
✅ Map visible in dashboard with all zones  
✅ Database contains all records  

## Performance Considerations

- Zones are saved sequentially (not in parallel) to avoid race conditions
- Each zone save is independent - if one fails, others continue
- Database uses JSONB for efficient coordinate storage
- UUID indexes allow fast zone lookups
- Foreign keys ensure referential integrity
