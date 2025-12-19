# TODO: Enable Data Storage for All Input Pages

## Completed
- [x] Fix backend ES module exports (categories.js, locations.js, requests.js)
- [x] Fix frontend Categories.js to use api instead of axios
- [x] Fix frontend Locations.js to use api instead of axios
- [x] Fix frontend Requests.js to use api instead of axios
- [x] Fix database schema.sql (insert roles before users, fix user role)

## Pending
- [x] Update Assets.js to use api
- [x] Update Employees.js to use api
- [x] Update purchase-orders.js to use api
- [x] Update SupplyAssets.js to use api
- [x] Update VendorAssets.js to use api
- [x] Update VendorRequests.js to use api
- [ ] Update MaintenanceTasks.js to use api
- [ ] Update NewConfiguration.js to use api
- [ ] Update UpdateMaintenance.js to use api
- [ ] Update WarrantyDocs.js to use api
- [ ] Update RegistrationRequests.js to use api
- [ ] Update Register.js to use api
- [ ] Test all forms for data storage
- [ ] Ensure database is set up (run schema.sql)

## Notes
- Backend routes are already implemented
- Frontend components need to import api from "../api" instead of axios
- Update all axios calls to api calls
- Implement fetch functions to load data
