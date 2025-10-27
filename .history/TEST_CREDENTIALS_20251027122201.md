# Test Credentials for MapIt

## 🔐 Admin Login

**Email:** `admin@mapit.com`
**Password:** `admin123`

Access at: `/admin`

---

## 👤 Customer Login

### Your Account (bcrypt)
**Email:** `eidi@gmail.com`
**Password:** The password you set during registration

### Sample Accounts (base64)
**Email:** `alice@example.com`, `bob@example.com`, `charlie@example.com`
**Password:** `Password123!`

---

## 📝 Password Storage Format

The system now supports **both** password formats:

### 🔒 Bcrypt (Recommended - for new accounts)
- More secure hashing algorithm
- Format: `$2b$10$...`
- Used for: New registrations and admin accounts
- Example: `$2b$10$WQaVcLQsPOFl.GFFPmRysO...`

### 📦 Base64 (Legacy - for old accounts)
- Simple encoding (less secure)
- Format: Base64 string
- Used for: Some existing customer accounts
- Example: `UGFzc3dvcmQxMjMh` = `Password123!`

---

## ✅ Login API Behavior

The `/api/login` endpoint automatically detects the password format:
1. Checks if password starts with `$2b$` or `$2a$` → Uses bcrypt comparison
2. Otherwise → Tries base64 decode → Compares plain text
3. If base64 fails → Direct string comparison

---

## 🆕 New Registrations

When new customers register via `/register`:
- Password is hashed using **bcrypt** (cost factor: 10)
- Stored in `customer.password_hash`
- First name and last name are extracted from the full name input
- More secure than legacy base64 encoding

---

## 🧪 Check Your Account

To see your account details and password format:

```bash
node check-customer-account.js your@email.com
```
