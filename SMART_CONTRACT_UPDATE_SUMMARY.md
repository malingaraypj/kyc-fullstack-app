# Smart Contract Update - Admin Visibility Control Implementation

## Overview

Updated the KYC fullstack application to implement customer privacy controls, allowing customers to manage whether admins can view their KYC details.

## Smart Contract Changes (Summary)

Your updated smart contract introduced the following new functionality:

- **New Function**: `setAdminVisibility(string _kycId, bool _visible)` - Allows customers to control admin access to their details
- **New Error**: `AdminAccessRevoked` - Thrown when admin tries to access a customer's details that have been blocked
- **New Event**: `CustomerAdminVisibilitySet(string indexed kycId, bool isVisible)` - Emitted when visibility is toggled
- **New Mapping**: `adminVisible` field in Customer struct - Tracks visibility status per customer

## Frontend Changes Made

### 1. **contract.ts** (`src/lib/contract.ts`)

**Changes:**

- Added `AdminAccessRevoked` error to the CONTRACT_ABI
- Added `setAdminVisibility` function definition to CONTRACT_ABI
  - Input: `_kycId` (string), `_visible` (bool)
  - Stateless: nonpayable
  - Allows customers to toggle admin visibility for their KYC data

### 2. **New Component: AdminVisibilityCard** (`src/components/customer/AdminVisibilityCard.tsx`)

**Purpose:** Allows customers to control who can see their KYC information

**Features:**

- Displays current visibility status with visual indicators (Eye/EyeOff icons)
- Toggle button to switch between visible/hidden states
- Clear messaging about privacy implications
- Loading states during transaction
- Success/Error toast notifications
- Responsive design with proper button styling

**Key States:**

- `isVisible`: tracks if admin can see customer's details
- `loading`: handles transaction processing
- Uses Badge component to show current status visually

### 3. **Updated: ApplicationStatusCard** (`src/components/customer/ApplicationStatusCard.tsx`)

**Changes:**

- Now displays both KYC status AND admin visibility controls
- Wraps both status card and privacy control card in a container
- Imported and integrated the new `AdminVisibilityCard` component
- Provides unified customer dashboard experience

**Layout:**

- Top: KYC Status Card (unchanged)
- Bottom: Admin Visibility Card (new)

### 4. **Updated: AdminDashboard** (`src/components/admin/AdminDashboard.tsx`)

**Changes:**

- Added `accessBlocked` property to CustomerData interface (optional field)
- Enhanced error handling in `loadCustomerAtIndex()` function to catch `AdminAccessRevoked` errors
- Returns placeholder customer object when access is blocked instead of skipping customer entirely
- Displays blocked customers in the list with restricted view

**Error Handling Strategy:**

- When `AdminAccessRevoked` error is caught, returns customer object with:
  - `accessBlocked: true` flag
  - Placeholder values for hidden details
  - Negative status (-1) to distinguish from normal statuses
  - Same KYC ID structure for filtering purposes

### 5. **Updated: CustomerCard** (`src/components/admin/CustomerCard.tsx`)

**Changes:**

- Added `accessBlocked` property to CustomerData interface
- Imported additional icons: `EyeOff`, `AlertTriangle`
- Added `Alert` and `AlertDescription` imports for blocked state message
- Implemented conditional rendering for access-blocked customers

**Blocked Access Display:**

- Special card styling with yellow background (`bg-yellow-50`, `border-yellow-200`)
- Shows "Customer Privacy Protected" message
- Displays explanation: "This customer has chosen to hide their details from admin view"
- Includes badge indicating "Access Blocked"
- Alert box explaining customer controls this setting

**Key Features:**

- Non-intrusive but informative UI
- Respects customer privacy choice
- Informs admin that customer has the ability to change this
- Prevents display of hidden customer data

## Component Interaction Flow

```
Customer Dashboard:
  ├─ ApplicationStatusCard (displayed when customer has existing application)
  │   ├─ KYC Status Display
  │   └─ AdminVisibilityCard (NEW)
  │       ├─ Show current visibility status
  │       ├─ Toggle button to change visibility
  │       └─ Call setAdminVisibility() on smart contract

Admin Dashboard:
  ├─ AdminDashboard
  │   └─ loadCustomerAtIndex()
  │       ├─ Try to get customer data
  │       ├─ If AdminAccessRevoked error:
  │       │   └─ Return placeholder with accessBlocked: true
  │       └─ Return normal customer data if accessible
  │
  └─ KycManagementTab
      └─ CustomerCard
          ├─ If accessBlocked === true:
          │   └─ Show "Privacy Protected" message
          └─ Else:
              └─ Show normal customer card with details
```

## User Flows

### Customer: Controlling Admin Visibility

1. Customer submits KYC application
2. After submission, customer is shown `ApplicationStatusCard`
3. Customer can see:
   - Their KYC ID and submission status
   - A "Privacy Control" section (AdminVisibilityCard)
   - Current visibility status (default: visible to admin)
4. Customer can click "Hide from Admin" to revoke admin access
5. After transaction confirmation, status updates to hidden
6. Customer can anytime click "Allow Admin Access" to restore visibility

### Admin: Viewing Customer Details

1. Admin loads dashboard
2. Admin sees list of KYC applications
3. If customer has blocked access:
   - Card shows "Customer Privacy Protected"
   - Message explains customer has chosen to hide details
   - No details or action buttons are shown for that customer
4. If customer hasn't blocked access:
   - Admin can view all customer details
   - Admin can approve, reject, or revoke applications
   - Admin can view documents

## Default Behavior

- **New Applications**: By default, `adminVisible = true` (admins can see details)
- **Customer Control**: Customers can change visibility at ANY time
- **Admin Visibility**: Takes effect immediately upon contract confirmation

## Error Handling

- If a customer blocks access, the smart contract throws `AdminAccessRevoked`
- Frontend gracefully handles this by displaying a privacy message
- No exceptions thrown to user; dashboard continues to load other customers
- Clear visual indicator that access is restricted (yellow card, eye-off icon)

## Security Considerations

✅ Customer privacy respected - customer controls visibility
✅ Admin cannot bypass restrictions - enforced at contract level
✅ Changes are transparent - events logged on blockchain
✅ Data remains in blockchain - just visibility is controlled
✅ No data deletion - customer can restore access anytime

## Testing Checklist

- [ ] Customer can submit application and see AdminVisibilityCard
- [ ] Customer can toggle visibility on/off successfully
- [ ] Transaction fees are handled properly
- [ ] Toast notifications show correct messages
- [ ] Admin dashboard doesn't crash when loading customers with blocked access
- [ ] Blocked customers show privacy message with no details
- [ ] Accessible customers show normal details and action buttons
- [ ] Switching between tabs refreshes data correctly
- [ ] Icon indicators (Eye/EyeOff) change appropriately

## Files Modified Summary

1. ✅ `src/lib/contract.ts` - Updated ABI and error definitions
2. ✅ `src/components/customer/AdminVisibilityCard.tsx` - Created NEW component
3. ✅ `src/components/customer/ApplicationStatusCard.tsx` - Integrated privacy control
4. ✅ `src/components/admin/AdminDashboard.tsx` - Added error handling
5. ✅ `src/components/admin/CustomerCard.tsx` - Added blocked access display

## Notes for Deployment

- Ensure smart contract is deployed with the updated KYC.sol
- Update CONTRACT_ADDRESS in contract.ts if deploying to new address
- No database migrations needed - all data is on-chain
- No breaking changes to existing APIs
- Backward compatible with existing customers
