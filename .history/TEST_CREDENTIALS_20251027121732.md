# Test Credentials for MapIt

## 🔐 Admin Login

**Email:** `admin@mapit.com`
**Password:** `admin123` (stored as bcrypt hash)

Access at: `/admin`

---

## 👤 Customer Login (Sample Accounts)

**Note:** Customer passwords are base64 encoded. The decoded password for all sample accounts is: `Password123!`

### Test Account 1
**Email:** `alice@example.com`
**Password:** `Password123!`

### Test Account 2
**Email:** `bob@example.com`
**Password:** `Password123!`

### Test Account 3
**Email:** `charlie@example.com`
**Password:** `Password123!`

---

## 📝 Password Storage Format

### Customers (`customer` table)
- Stored in `password_hash` column
- Format: **Base64 encoded**
- Example: `UGFzc3dvcmQxMjMh` = `Password123!`

### Admins (`admin` table)
- Stored in `password_hash` column
- Format: **Bcrypt hash** (`$2b$10$...`)
- Cost factor: 10

---

## 🆕 New Registrations

When new customers register via `/register`:
- Password is automatically encoded to base64
- Stored in `customer.password_hash`
- First name and last name are extracted from the full name input

---

## 🧪 Testing

To test the password encoding:

```javascript
// Encode (for registration)
const encoded = Buffer.from('Password123!').toString('base64');
// Result: 'UGFzc3dvcmQxMjMh'

// Decode (for login verification)
const decoded = Buffer.from('UGFzc3dvcmQxMjMh', 'base64').toString('utf-8');
// Result: 'Password123!'
```
