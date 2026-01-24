# ⚡ Quick Start Guide - Employee & Supervisor Reporting

## 🚀 30-Second Setup

```bash
# Terminal 1 - Start Backend
cd backend
node server.js
# ✅ Watch for: "Server running on port 5000"

# Terminal 2 - Start Frontend  
cd frontend
npm start
# ✅ Browser will open http://localhost:3000
```

---

## 📱 Where to Find It

### For Employees
1. Login with employee account
2. Look for **"My Details"** in sidebar menu
3. Click it!
4. Switch tabs: Overview | Location & Room | My Assets

### For Supervisors
1. Login with supervisor account
2. Look for **"My Team Report"** in sidebar menu
3. Click it!
4. Search/filter employees on the left
5. Click any employee to see details

---

## 🧪 What to Test

### Employee View
- [x] Click "My Details"
- [x] See your location
- [x] See your room assignment
- [x] See all your assets in a table
- [x] Notice asset count in stats

### Supervisor View
- [x] Click "My Team Report"
- [x] Search for an employee
- [x] Click an employee name
- [x] See their location and room
- [x] See all their assets

---

## 🎯 Test Accounts in Database

```
Employee: Bob, Jane, or John
Supervisor: Bob Supervisor
Admin: Your admin account
```

Each employee has 1-2 assets assigned.

---

## 🔄 Data Flow

```
Employee John
    ↓
My Details page
    ├→ Location: Test Building
    ├→ Room: No Room
    └→ Assets: Laptop, Monitor
    
Supervisor Bob
    ↓
My Team Report
    ├→ Bob Employee (1 asset)
    ├→ Jane Employee (1 asset)
    └→ John Employee (2 assets) ← Click to see detail
```

---

## 📊 Backend API Endpoints

| Path | What It Does |
|------|---|
| `GET /api/reports/my-details` | Get your profile |
| `GET /api/reports/my-assets` | Get your assets |
| `GET /api/reports/supervisor/my-employees` | Get your team |
| `GET /api/reports/supervisor/employee/8/details` | Get employee details |
| `PUT /api/reports/employee/8/location` | Update location |

---

## ✨ Features at a Glance

| Feature | Employee | Supervisor | Admin |
|---------|----------|-----------|-------|
| View own profile | ✅ | - | ✅ |
| View own assets | ✅ | - | ✅ |
| View team | - | ✅ | ✅ |
| See location/room | ✅ | ✅ | ✅ |
| Update location | - | Own team | All |
| Search employees | - | ✅ | ✅ |

---

## 🐛 If Something Breaks

| Problem | Solution |
|---------|----------|
| Page doesn't load | Restart backend server |
| No data shown | Check you're logged in with correct role |
| Search doesn't work | Refresh page |
| 404 errors | Backend needs to restart |
| No "My Details" menu | Login as Employee |
| No "My Team Report" menu | Login as Supervisor |

---

## 📂 Key Files

```
Backend:
  backend/routes/reports.js ← All API endpoints here
  
Frontend:
  frontend/src/pages/EmployeeDetails.js ← Employee view
  frontend/src/pages/SupervisorReport.js ← Supervisor view
  
Navigation:
  frontend/src/components/Layout.js ← Menu items
```

---

## 🔐 Security

✅ Only see your own data (Employee)
✅ Only see your team (Supervisor)
✅ See everything (Admin)
✅ All requests require login
✅ All requests require correct role

---

## 🎨 What You'll See

### Employee Tab: Overview
```
┌─────────────────────────┐
│ John Employee           │
│ john@email.com          │
│ IT Department           │
│                         │
│ Total Assets: 2         │
└─────────────────────────┘
```

### Employee Tab: My Assets
```
┌──────────────────────────────────────┐
│ Asset Name │ Serial │ Status │ Loc   │
├──────────────────────────────────────┤
│ Laptop     │ SN123  │ ✓      │ Test  │
│ Monitor    │ SN456  │ ✓      │ Test  │
└──────────────────────────────────────┘
```

### Supervisor View: Employee List
```
┌────────────────────────────────────┐
│ Search: [_________]                │
├────────────────────────────────────┤
│ 👤 Bob Employee                    │
│    bob@email.com | 1 assets        │
├────────────────────────────────────┤
│ 👤 Jane Employee                   │
│    jane@email.com | 1 assets       │
├────────────────────────────────────┤
│ 👤 John Employee                   │
│    john@email.com | 2 assets       │
└────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Search is instant** - Type name or email to filter
2. **Click any employee** - See full details and assets on right
3. **Dark mode works** - Use theme toggle in header
4. **Responsive design** - Works on mobile too
5. **Real data** - All info syncs with database

---

## 📞 Help

- **Backend won't start?** Check port 5000 is free
- **Frontend won't load?** Check port 3000 is free
- **No data?** Verify you're logged in
- **Page missing?** Verify you have correct role

---

## ✅ Verification Checklist

Before you start:
- [x] Backend running: `node server.js`
- [x] Frontend running: `npm start`
- [x] Can login successfully
- [x] See sidebar menu

During testing:
- [x] See "My Details" as Employee
- [x] See "My Team Report" as Supervisor
- [x] Can click between tabs
- [x] Can search employees
- [x] Data appears correctly

---

**Ready to go! Happy testing! 🚀**
