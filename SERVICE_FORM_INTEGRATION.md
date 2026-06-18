# Service Registration Form Integration

## Overview
Integrated the ServiceRegistrationForm component into service detail pages, allowing users to submit service-specific registration requests directly from the landing pages without logging in.

## What Was Done

### 1. **Created Form Schema** (`src/lib/service-forms-schema.ts`)
Type-safe Zod schemas for all four service forms:

#### Research Form Fields
- Full name, email, phone, institution
- Research title, category, abstract
- Estimated budget, duration (months)
- Agreement checkbox

**Categories:**
- AI & Data
- Smart City
- Cybersecurity
- Public Sector Innovation
- Other

#### Transformation Form Fields
- Agency name, type, contact person, position
- Email, phone
- Current digital maturity level
- Scope & objectives, expected start date
- Agreement checkbox

**Agency Types:**
- Bureau
- Sub-city
- Public Enterprise
- Other

**Maturity Levels:**
- Initial
- Developing
- Established
- Advanced

#### Licensing Form Fields
- Applicant type (Individual/Firm/Vendor)
- Full/Company name, National ID/TIN
- Email, phone, organization
- Category, grade, experience years
- Agreement checkbox

**Categories:**
- Software Development
- Networking & Infrastructure
- Cybersecurity
- Data & AI
- IT Consulting
- Hardware Supply

**Grades:**
- Grade 1, Grade 2, Grade 3

#### LMS Form Fields
- Learner name, employee ID
- Work email, phone
- Agency, position
- Program, cohort
- Optional notes
- Agreement checkbox

**Programs:**
- Digital Leadership
- Cybersecurity Awareness
- Public Sector Data Analytics
- AI for Government
- Project Management

**Cohorts:**
- Self-paced
- Q1, Q2, Q3, Q4 Cohorts

### 2. **Updated Service Detail Page** (`src/routes/services.$serviceSlug.tsx`)

#### New Features Added:

**Toggle Form Display**
```tsx
const [showForm, setShowForm] = useState(false);
```

**Dual CTA Buttons**
- Primary: Show/Hide registration form
- Secondary: Sign in to dashboard (for existing users)

**Form Section**
- Conditionally rendered below CTA section
- Full-width form container with elegant styling
- Contextual heading showing service name
- Proper spacing and padding

## User Flow

### New User Journey (Without Login)

```
1. Visit service detail page
   ↓
2. Read about service features & benefits
   ↓
3. Click "[Service] Registration" button
   ↓
4. Form slides into view
   ↓
5. Fill out service-specific form
   ↓
6. Submit application
   ↓
7. Receive confirmation toast with reference number
   ↓
8. Email confirmation sent (simulated)
```

### Existing User Journey

```
1. Visit service detail page
   ↓
2. Click "Sign In to Dashboard"
   ↓
3. Navigate to /login
   ↓
4. Authenticate
   ↓
5. Access full portal features
```

## UI Components

### CTA Section (Updated)
```
┌─────────────────────────────────────────────────────────┐
│         [Gradient Background with Glow Effect]          │
│                                                          │
│         Ready to Get Started?                           │
│         [Service-specific subtext]                      │
│                                                          │
│  [📄 Show Form Button]  [Sign In to Dashboard →]       │
└─────────────────────────────────────────────────────────┘
```

### Form Section (When Visible)
```
┌─────────────────────────────────────────────────────────┐
│                 [Service CTA Text]                       │
│     Fill out the form below to submit your request      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ APPLICANT / AGENCY INFO                          │   │
│  │ [Name]        [Email]                            │   │
│  │ [Phone]       [Other fields...]                  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ SERVICE-SPECIFIC FIELDS                          │   │
│  │ [Field 1]     [Field 2]                          │   │
│  │ [Field 3]     [Field 4]                          │   │
│  │ [Long text field spanning full width]           │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ CONSENT                                          │   │
│  │ ☐ I confirm the information is accurate...      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Your info is encrypted...   [Submit Button] 📤  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Form Features

### Validation
- ✅ Real-time field validation
- ✅ Required field checking
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Minimum character lengths
- ✅ Number range validation

### UX Enhancements
- ✅ Responsive grid layout (1 col mobile, 2 col desktop)
- ✅ Loading states with spinner
- ✅ Success/error toast notifications
- ✅ Form reset after successful submission
- ✅ Character counter on text areas
- ✅ Placeholder text for guidance
- ✅ Disabled submit during processing

### Security & Privacy
- ✅ Required consent checkbox
- ✅ Privacy notice displayed
- ✅ Encrypted transmission message
- ✅ PII handling notice
- ✅ Form data validated on client

## Form Submission

### Current Implementation (Simulated)
```typescript
async function fakeSubmit(payload: unknown) {
  // Simulate 900ms API delay
  await new Promise((r) => setTimeout(r, 900));
  
  // Generate reference number
  const reference = "STRP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  
  return { reference, payload };
}
```

### Success Response
```
Toast Notification:
┌─────────────────────────────────────────────────┐
│ ✓ Research proposal received                    │
│                                                  │
│ Reference: STRP-A3K9F2                          │
│ You'll get a confirmation by email.             │
└─────────────────────────────────────────────────┘
```

### Future Backend Integration
Replace `fakeSubmit()` with actual API call:

```typescript
async function submitServiceRegistration(
  serviceSlug: string,
  payload: unknown
) {
  const response = await fetch(
    `${API_URL}/api/services/${serviceSlug}/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) throw new Error('Submission failed');
  return response.json();
}
```

## Styling

### Form Container
```css
.form-container {
  /* Border & Background */
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 1.5rem;
  
  /* Shadow */
  box-shadow: var(--shadow-elegant);
  
  /* Padding */
  padding: 3rem;  /* Desktop */
  padding: 2rem;  /* Mobile */
}
```

### Section Headings
```css
.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}
```

### Submit Button
```css
.submit-button {
  background: var(--gradient-primary);
  color: var(--primary-foreground);
  box-shadow: var(--shadow-elegant);
  border-radius: 0.75rem;
  height: 2.75rem;
}
```

## Responsive Behavior

### Mobile (< 640px)
```
Form Layout:
┌──────────────────┐
│ [Field 1]        │
│ [Field 2]        │
│ [Field 3]        │
│ [Field 4]        │
│ [Long field]     │
│ [Checkbox]       │
│ [Submit]         │
└──────────────────┘

Single column, stacked fields
```

### Desktop (≥ 640px)
```
Form Layout:
┌─────────────────────────────┐
│ [Field 1]    [Field 2]      │
│ [Field 3]    [Field 4]      │
│ [Long field spanning 2 cols]│
│ [Checkbox spanning 2 cols]  │
│ [Privacy] [Submit Button]   │
└─────────────────────────────┘

Two column grid layout
```

## Service-Specific Form Differences

### Research Form
- Longest abstract field (detailed research description)
- Duration in months selector
- Optional budget field
- Research category dropdown

### Transformation Form
- Agency type selector
- Digital maturity level dropdown
- Expected start date picker
- Focus on organizational context

### Licensing Form
- Applicant type selection (Individual/Firm/Vendor)
- Grade selection (1-3)
- Experience years number input
- Professional category dropdown

### LMS Form
- Employee ID field
- Program selection
- Cohort/batch selection
- Optional accessibility notes

## Testing Checklist

### Per Service
- [ ] Visit `/services/research` - Click "Submit proposal"
- [ ] Visit `/services/transformation` - Click "Submit request"
- [ ] Visit `/services/licensing` - Click "Apply for license"
- [ ] Visit `/services/lms` - Click "Register learner"

### Form Functionality
- [ ] Form appears when button clicked
- [ ] Form hides when "Hide Form" clicked
- [ ] All fields render correctly
- [ ] Validation errors show on invalid input
- [ ] Required fields marked and enforced
- [ ] Dropdowns populated with correct options
- [ ] Number fields only accept numbers
- [ ] Date picker works on date fields
- [ ] Text areas have character counter
- [ ] Checkbox required to submit
- [ ] Submit button disabled during submission
- [ ] Loading spinner shows during submit
- [ ] Success toast appears after submit
- [ ] Reference number generated
- [ ] Form resets after successful submit
- [ ] Error toast appears on failure

### Responsive Design
- [ ] Form displays correctly on mobile
- [ ] Two-column grid on desktop
- [ ] All fields accessible on all screen sizes
- [ ] Submit button visible and clickable
- [ ] No horizontal scrolling

### Accessibility
- [ ] All fields have proper labels
- [ ] Error messages announced
- [ ] Form can be navigated with keyboard
- [ ] Focus indicators visible
- [ ] Required fields marked

## Integration Points

### With Backend (Future)
```
POST /api/services/research/register
POST /api/services/transformation/register
POST /api/services/licensing/register
POST /api/services/lms/register

Request Body: {
  ...form fields as per schema
}

Response: {
  success: true,
  reference: "STRP-A3K9F2",
  message: "Application received",
  estimatedReviewTime: "3-5 business days"
}
```

### Email Notifications (Future)
- Confirmation email to applicant
- Notification to review team
- Status update emails
- Reminder emails for incomplete applications

### Dashboard Integration (Future)
- View submitted applications
- Track application status
- Upload additional documents
- Respond to review requests

## Benefits

### For Users
- ✅ No login required for initial submission
- ✅ Service-specific forms (only relevant fields)
- ✅ Clear validation and guidance
- ✅ Immediate confirmation
- ✅ Reference number for tracking

### For STRP
- ✅ Structured data collection
- ✅ Reduced manual data entry
- ✅ Lower barrier to entry
- ✅ Better lead capture
- ✅ Automated processing ready

## Next Steps

### Priority Enhancements
1. **Backend Integration** - Connect to actual API
2. **File Uploads** - Add document attachment support
3. **Save Draft** - Allow users to save and return later
4. **Email Confirmation** - Automated email with reference
5. **Application Status** - Public status check page

### Future Features
1. **Multi-step Forms** - Break long forms into steps
2. **Payment Integration** - For fee-based services
3. **Digital Signatures** - E-signature support
4. **Auto-save** - Save form data in local storage
5. **Pre-fill for Logged Users** - Auto-populate known fields

## Summary

✅ **Service registration forms integrated** into all four service detail pages

✅ **Type-safe validation** with Zod schemas for data integrity

✅ **Elegant UI** with smooth show/hide animation

✅ **Dual pathways** - Register without login OR sign in for full access

✅ **Service-specific fields** tailored to each service's requirements

✅ **Mobile responsive** with proper grid layouts

✅ **User-friendly** with validation, loading states, and confirmations

The forms provide a low-friction way for potential users to express interest and submit initial requests before committing to full account creation.
