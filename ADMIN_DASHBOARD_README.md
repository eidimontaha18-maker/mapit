# Admin Dashboard - MapIt Application

## 🎉 Overview

The Admin Dashboard provides a comprehensive view of all maps created by customers with modern, responsive design. Admins can monitor all user activity, view map details, and access customer information.

## 🔐 Admin Access

### Default Admin Credentials
- **Email:** `admin@mapit.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password after first login for security!

### Login Process
1. Go to the login page (same as customer login)
2. Enter admin credentials
3. System automatically detects admin user and redirects to `/admin/dashboard`
4. Customer users will be redirected to their regular dashboard

## 🎨 Features

### Dashboard Statistics
- **Total Maps:** View the total number of maps created across all customers
- **Total Customers:** See how many registered users exist
- **Total Zones:** Count of all zones drawn on all maps
- **Active Maps:** Number of currently active maps

### Maps Table
The admin dashboard displays a comprehensive table with:

| Column | Description |
|--------|-------------|
| **ID** | Unique map identifier |
| **Map Title** | Name and description of the map |
| **Customer** | Customer name and email who created the map |
| **Country** | Country associated with the map |
| **Zones** | Number of zones drawn on this map |
| **Created** | Map creation date |
| **Status** | Active/Inactive status |
| **Actions** | View map button (opens in new tab) |

### Advanced Features

#### 🔍 Search & Filter
- **Search Bar:** Search by map title, customer name, email, or country
- **Status Filter:** 
  - All Maps
  - Active Maps Only
  - Inactive Maps Only

#### 📊 Sorting
- Click any column header to sort
- Click again to reverse sort direction
- Visual indicators (↑↓) show current sort

#### 📄 Pagination
- 10 items per page
- Navigate with Previous/Next buttons
- Shows current page and total pages

#### 🔄 Refresh
- Manual refresh button to reload latest data
- Keeps current filter and search settings

## 🎨 Design Features

### Responsive Design
- **Desktop:** Full-featured table with all columns
- **Tablet:** Optimized layout with adjusted spacing
- **Mobile:** Stacked cards, scrollable table, touch-friendly buttons

### Modern UI Elements
- Gradient backgrounds and cards
- Smooth animations and transitions
- Hover effects on interactive elements
- Color-coded status badges
- Icon-enhanced interface

### Color Scheme
- **Primary Gradient:** Purple to violet (#667eea → #764ba2)
- **Success:** Green badges for active items
- **Warning:** Red badges for inactive items
- **Info:** Blue badges for zone counts

## 🚀 API Endpoints

The admin dashboard uses these backend endpoints:

### 1. Admin Login
```
POST /api/admin/login
Body: { email, password }
Response: { success, admin: { admin_id, email, first_name, last_name } }
```

### 2. Get All Maps
```
GET /api/admin/maps
Response: { 
  success, 
  maps: [{
    map_id, title, description, map_code, created_at,
    active, country, customer_id, first_name, last_name,
    email, registration_date, zone_count
  }],
  total
}
```

### 3. Get Dashboard Statistics
```
GET /api/admin/stats
Response: { 
  success, 
  stats: {
    totalMaps, totalCustomers, totalZones, 
    activeMaps, recentActivity
  }
}
```

## 🛠️ Setup Instructions

### 1. Database Setup (Already Done)
```bash
node setup-admin.js
```

This creates:
- `admin` table with admin credentials
- Default admin user
- Necessary indexes

### 2. Start the Server
```bash
npm run server
# or
node server.js
```

### 3. Start the Frontend
```bash
npm run dev
```

### 4. Access Admin Dashboard
1. Navigate to `http://localhost:5173/login`
2. Login with admin credentials
3. You'll be automatically redirected to `/admin/dashboard`

## 🔒 Security Features

1. **Separate Authentication:** Admin login uses separate table and endpoint
2. **Password Hashing:** bcrypt encryption for passwords
3. **Session Storage:** Admin status stored in localStorage
4. **Route Protection:** Dashboard checks admin status on mount
5. **Auto-redirect:** Non-admin users redirected to login

## 📱 Responsive Breakpoints

- **Desktop:** > 1024px (full layout)
- **Tablet:** 768px - 1024px (adjusted layout)
- **Mobile:** < 768px (stacked/scrollable)
- **Small Mobile:** < 480px (compact view)

## 🎯 Usage Tips

1. **Viewing Maps:** Click the eye icon to view any customer's map in a new tab
2. **Searching:** Type any part of title, name, email, or country to filter
3. **Quick Stats:** Stats cards at the top provide instant overview
4. **Sorting:** Click column headers to sort by that field
5. **Refresh:** Use refresh button after customers create new maps

## 🔧 Customization

### Adding More Admin Users

Run this SQL command in your database:

```sql
INSERT INTO admin (email, password_hash, first_name, last_name)
VALUES (
  'newemail@example.com',
  '$2b$10$HASHED_PASSWORD_HERE',
  'First',
  'Last'
);
```

Or create a script similar to `setup-admin.js` with different credentials.

### Modifying Table Columns

Edit `src/pages/AdminDashboard.tsx`:
- Add/remove columns in the `<thead>` section
- Update corresponding data in the `<tbody>` map function
- Adjust sort functionality if needed

### Changing Items Per Page

In `src/pages/AdminDashboard.tsx`, modify:
```typescript
const itemsPerPage = 10; // Change this number
```

## 🐛 Troubleshooting

### Admin Login Not Working
1. Check database connection
2. Verify admin table exists: `SELECT * FROM admin;`
3. Check server logs for errors
4. Ensure bcrypt is installed: `npm install bcryptjs`

### Dashboard Not Loading
1. Open browser console for errors
2. Check if server is running on port 3101
3. Verify API endpoints are accessible
4. Check localStorage for `isAdmin` flag

### Style Issues
1. Clear browser cache
2. Check if CSS file is imported in component
3. Verify file path: `src/styles/AdminDashboard.css`

## 📊 Future Enhancements

Potential features to add:
- Delete/Edit map functionality
- Bulk actions (activate/deactivate multiple maps)
- Export data to CSV/Excel
- Advanced analytics and charts
- Customer management (block/unblock users)
- Map preview thumbnails
- Email notifications
- Activity logs

## 📞 Support

For issues or questions:
1. Check server console logs
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all npm packages are installed

---

**Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** ✅ Production Ready
