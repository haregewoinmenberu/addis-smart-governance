# 🚀 Quick Start Guide

## For ITDB Administrators

### 1. Login to the System
```
URL: http://your-domain/login
Email: your-admin-email@itdb.gov.et
Password: your-password
```

### 2. Access Sub-Cities Management
After login, you'll see the dashboard. Look for **"Sub-Cities"** in the left sidebar (between "Notifications" and "User Management").

### 3. Register Your First Sub-City

**Click the "Register Sub-City" button** and fill in:

#### Organization Details
- **Name:** e.g., "Bole Sub-City"
- **Code:** e.g., "BSC" (unique identifier)
- **Description:** Brief description of the sub-city
- **Address:** Physical location
- **Phone:** Contact number
- **Email:** Official email
- **Website:** (optional)
- **Logo:** Upload organization logo (optional, max 2MB)

#### Administrator Account
- **Full Name:** e.g., "John Doe"
- **Email:** e.g., "admin@bole.gov.et" (will be used for login)
- **Phone:** Contact number
- **Password:** Minimum 8 characters

**Click "Register Sub-City"** and you're done! ✅

### 4. What Happens Next?

The system will:
1. ✅ Create the sub-city organization
2. ✅ Create the administrator account
3. ✅ Assign the `sub_city_admin` role
4. ✅ Send you a success notification

---

## For Sub-City Administrators

### 1. Login with Your Credentials
```
URL: http://your-domain/login
Email: (provided during registration)
Password: (provided during registration)
```

### 2. Access Your Dashboard
After login, you'll see your personalized dashboard showing:
- Your sub-city's data only
- Your users
- Your technology requests
- Your reports and statistics

### 3. What You Can Do

#### Manage Users
- Navigate to "User Management"
- Add new users to your sub-city
- Assign roles and permissions
- Activate/deactivate users

#### Submit Technology Requests
- Navigate to "Technology Requests"
- Click "New Request"
- Fill in the request details
- Submit for approval

#### View Reports
- Navigate to "Reports & Analytics"
- View your sub-city's statistics
- Generate custom reports
- Export data

### 4. What You Cannot Do

❌ You will NOT see "Sub-Cities" in the sidebar  
❌ You cannot access other sub-cities' data  
❌ You cannot register new sub-cities  
❌ You cannot manage other sub-cities  

This is by design for security and data isolation! 🔒

---

## Common Tasks

### Task 1: Register a New Sub-City (ITDB Admin)

1. Login as ITDB administrator
2. Click "Sub-Cities" in sidebar
3. Click "Register Sub-City" button
4. Fill in organization details
5. Fill in administrator details
6. Upload logo (optional)
7. Click "Register Sub-City"
8. ✅ Done!

**Time:** ~2 minutes

---

### Task 2: View Sub-City Statistics (ITDB Admin)

1. Login as ITDB administrator
2. Click "Sub-Cities" in sidebar
3. See statistics cards at the top:
   - Total Sub-Cities
   - Active Sub-Cities
   - Inactive Sub-Cities
   - Total Users
4. Click the "eye" icon on any sub-city row
5. View detailed statistics

**Time:** ~30 seconds

---

### Task 3: Activate/Deactivate a Sub-City (ITDB Admin)

1. Login as ITDB administrator
2. Click "Sub-Cities" in sidebar
3. Find the sub-city in the table
4. Click the checkmark (activate) or X (deactivate) icon
5. Confirm the action
6. ✅ Done!

**Time:** ~10 seconds

---

### Task 4: Add a User to Your Sub-City (Sub-City Admin)

1. Login as sub-city administrator
2. Click "User Management" in sidebar
3. Click "Add User" button
4. Fill in user details:
   - Name
   - Email
   - Password
   - Phone
   - Department
5. Assign role
6. Click "Create User"
7. ✅ Done!

**Time:** ~1 minute

---

### Task 5: Submit a Technology Request (Sub-City Admin)

1. Login as sub-city administrator
2. Click "Technology Requests" in sidebar
3. Click "New Request" button
4. Fill in request details:
   - Title
   - Description
   - Technology type
   - Budget estimate
   - Justification
5. Upload supporting documents
6. Click "Submit Request"
7. ✅ Done!

**Time:** ~3 minutes

---

## Troubleshooting

### Problem: Can't see "Sub-Cities" in sidebar

**Solution:**
- Check if you're logged in as ITDB administrator
- Sub-city administrators will NOT see this menu item
- This is expected behavior for security

---

### Problem: Redirected to login when accessing dashboard

**Solution:**
- Your session may have expired
- Login again with your credentials
- You'll be redirected back to the page you were trying to access

---

### Problem: Can't register a sub-city

**Solution:**
- Check if you have ITDB administrator role
- Verify all required fields are filled
- Ensure the sub-city code is unique
- Check that the administrator email is not already in use

---

### Problem: Logo not displaying

**Solution:**
- Ensure the image is less than 2MB
- Use supported formats: JPG, PNG, GIF
- Try uploading again
- Contact system administrator if issue persists

---

## Quick Commands (For Developers)

### Check System Status
```bash
# Check database
php artisan tinker
>>> App\Models\SubCity::count()

# Check routes
php artisan route:list --path=sub-cities

# Check roles
>>> App\Models\Role::where('name', 'sub_city_admin')->first()
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### View Logs
```bash
tail -f storage/logs/laravel.log
```

---

## URLs Reference

| Page | URL | Access |
|------|-----|--------|
| Login | `/login` | Public |
| Dashboard | `/` | Authenticated |
| Sub-Cities | `/sub-cities` | ITDB Admin |
| Users | `/users` | Authenticated |
| Requests | `/requests` | Authenticated |
| Reports | `/reports` | Authenticated |

---

## Support

### Need Help?

**Documentation:**
- User Guide: `SUB_CITY_MULTI_TENANT_GUIDE.md`
- Visual Guide: `NAVIGATION_VISUAL_GUIDE.md`
- Quick Reference: `QUICK_REFERENCE.md`

**Contact:**
- Email: support@itdb.gov.et
- Phone: +251-11-XXX-XXXX
- Help Desk: [Internal Portal]

---

## Tips & Best Practices

### For ITDB Administrators

✅ **DO:**
- Use clear, descriptive names for sub-cities
- Assign unique codes (e.g., BSC, ASC, KSC)
- Provide complete contact information
- Upload logos for better branding
- Regularly review sub-city statistics
- Keep administrator contact info updated

❌ **DON'T:**
- Use duplicate sub-city codes
- Delete sub-cities with active users
- Share administrator passwords
- Forget to activate new sub-cities

### For Sub-City Administrators

✅ **DO:**
- Keep your profile information updated
- Regularly review your users
- Submit detailed technology requests
- Provide justification for requests
- Monitor your sub-city's statistics

❌ **DON'T:**
- Share your login credentials
- Create duplicate user accounts
- Submit incomplete requests
- Ignore pending approvals

---

## Next Steps

### After First Login

1. ✅ Update your profile
2. ✅ Change your password (if needed)
3. ✅ Explore the dashboard
4. ✅ Familiarize yourself with the navigation
5. ✅ Read the user guide

### For ITDB Administrators

1. ✅ Register all sub-cities
2. ✅ Verify administrator accounts
3. ✅ Review system statistics
4. ✅ Set up monitoring
5. ✅ Train sub-city administrators

### For Sub-City Administrators

1. ✅ Add your team members
2. ✅ Submit pending requests
3. ✅ Review your statistics
4. ✅ Set up notifications
5. ✅ Explore available features

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Search (if implemented) |
| `Esc` | Close dialogs |
| `Tab` | Navigate form fields |
| `Enter` | Submit forms |

---

## Video Tutorials (Coming Soon)

- [ ] How to register a sub-city
- [ ] How to manage users
- [ ] How to submit requests
- [ ] How to view reports
- [ ] How to use the dashboard

---

## Frequently Asked Questions

**Q: How many sub-cities can I register?**  
A: There's no limit. You can register as many sub-cities as needed.

**Q: Can I change the administrator later?**  
A: Yes, ITDB administrators can reassign administrators.

**Q: What happens if I deactivate a sub-city?**  
A: Users from that sub-city won't be able to login, but data is preserved.

**Q: Can sub-city administrators see other sub-cities?**  
A: No, they can only see their own sub-city's data.

**Q: How do I reset a password?**  
A: Use the "Forgot Password" link on the login page.

---

## Success Checklist

### For ITDB Administrators
- [ ] Logged in successfully
- [ ] Can see "Sub-Cities" in sidebar
- [ ] Registered first sub-city
- [ ] Verified administrator account
- [ ] Viewed sub-city statistics
- [ ] Tested activate/deactivate

### For Sub-City Administrators
- [ ] Logged in successfully
- [ ] Can access dashboard
- [ ] Added first user
- [ ] Submitted first request
- [ ] Viewed reports
- [ ] Updated profile

---

**🎉 You're all set! Start managing your sub-cities now! 🎉**

For detailed information, refer to the complete documentation in the project root directory.
