# Database Setup & Troubleshooting Guide

## Quick Start

### 1. Test Database Connection
```bash
npm run test-db
```

This will:
- Test MySQL server connection
- Check if database exists
- List all tables
- Show detailed error messages if something fails

### 2. Setup Database (if needed)
```bash
npm run setup-db
```

This will:
- Create the database if it doesn't exist
- Check existing tables
- Provide guidance on running schema.sql

### 3. Run Database Schema
If the database is empty, import the schema:
```bash
mysql -u root -p asset_management < ../database/schema.sql
```

Or use MySQL Workbench to run the `database/schema.sql` file.

## Environment Variables

Make sure you have a `.env` file in either:
- `backend/.env` (preferred)
- Root directory `.env` (fallback)

Required variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=asset_management
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## Common Issues

### Error: "Access denied for user 'root'@'localhost'"

**Cause:** Incorrect MySQL password in `.env` file.

**Solutions:**
1. **Update .env file** with the correct MySQL root password
2. **Reset MySQL password** if you forgot it:
   - Windows: Use MySQL Workbench or Command Prompt
   - Follow MySQL password reset guide for your OS
3. **Create a new MySQL user** (recommended for production):
   ```sql
   CREATE USER 'asset_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON asset_management.* TO 'asset_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
   Then update `.env`:
   ```env
   DB_USER=asset_user
   DB_PASSWORD=secure_password
   ```

### Error: "ECONNREFUSED"

**Cause:** MySQL server is not running.

**Solution:**
- Start MySQL service:
  - Windows: Services → MySQL → Start
  - Or use: `net start MySQL` (as administrator)

### Error: "ER_BAD_DB_ERROR" - Database doesn't exist

**Cause:** Database `asset_management` hasn't been created.

**Solution:**
```bash
npm run setup-db
```
Or manually:
```sql
CREATE DATABASE asset_management;
```

### Error: No tables found

**Cause:** Database exists but schema hasn't been imported.

**Solution:**
```bash
mysql -u root -p asset_management < database/schema.sql
```

## Verification

After fixing issues, verify everything works:

1. **Test connection:**
   ```bash
   npm run test-db
   ```

2. **Start server:**
   ```bash
   npm run dev
   ```

3. **Check server logs** - you should see:
   ```
   ✅ Database connected successfully!
   ✅ Server running on port 5000
   ```

## Files Modified

- `backend/config/database.js` - Enhanced with:
  - Multi-location .env loading
  - Connection testing on startup
  - Better error messages
  - Environment variable validation

- `backend/server.js` - Enhanced with:
  - Multi-location .env loading
  - Startup logging

- `backend/scripts/testConnection.js` - New diagnostic script
- `backend/scripts/setupDatabase.js` - New setup helper script

## Support

If you continue to have issues:
1. Run `npm run test-db` and share the output
2. Check MySQL service is running
3. Verify `.env` file has correct credentials
4. Check MySQL error logs for more details

