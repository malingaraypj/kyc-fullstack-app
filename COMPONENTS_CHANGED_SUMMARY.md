# Components Changed - Quick Reference

## Summary Table

| Component                    | File Path                                           | Changes                                                          | Status      |
| ---------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- | ----------- |
| **Contract ABI**             | `src/lib/contract.ts`                               | Added `AdminAccessRevoked` error + `setAdminVisibility` function | ✅ Complete |
| **Admin Visibility Control** | `src/components/customer/AdminVisibilityCard.tsx`   | NEW component - Toggle admin access                              | ✅ Created  |
| **Application Status**       | `src/components/customer/ApplicationStatusCard.tsx` | Integrated AdminVisibilityCard                                   | ✅ Updated  |
| **Admin Dashboard**          | `src/components/admin/AdminDashboard.tsx`           | Error handling for blocked access + accessBlocked field          | ✅ Updated  |
| **Customer Card**            | `src/components/admin/CustomerCard.tsx`             | Display for blocked customers                                    | ✅ Updated  |

---

## Component Dependencies Graph

```
Smart Contract (Blockchain)
    ↓
contract.ts (ABI + Functions)
    ├─→ getContract(admin=true/false)
    │
    ├─→ Customer-side:
    │   └─→ ApplicationStatusCard
    │       └─→ AdminVisibilityCard (NEW)
    │           └─→ setAdminVisibility() call
    │
    └─→ Admin-side:
        └─→ AdminDashboard
            ├─→ loadCustomers()
            │   └─→ getCustomerAt() [catches AdminAccessRevoked]
            │
            └─→ KycManagementTab
                └─→ CustomerCard
                    └─→ Conditional render based on accessBlocked
```

---

## Detailed Changes by Component

### 1. contract.ts

```typescript
// ADDED:
{
  inputs: [],
  name: "AdminAccessRevoked",
  type: "error",
}

{
  inputs: [
    { internalType: "string", name: "_kycId", type: "string" },
    { internalType: "bool", name: "_visible", type: "bool" },
  ],
  name: "setAdminVisibility",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
}
```

### 2. AdminVisibilityCard.tsx (NEW FILE)

- Component for customer privacy control
- Allows toggle between visible/hidden states
- Displays current status with icons
- Handles contract interaction and transaction feedback

### 3. ApplicationStatusCard.tsx

**Before:** Single card showing KYC ID and status
**After:** Two-card layout with status + privacy control

### 4. AdminDashboard.tsx

**Key Change:** Enhanced error handling

```typescript
interface CustomerData {
  // ... existing fields ...
  accessBlocked?: boolean; // NEW field
}

async function loadCustomerAtIndex(index: number) {
  try {
    // Get customer data
  } catch (error: any) {
    // NEW: Check for AdminAccessRevoked
    if (error.message?.includes("AdminAccessRevoked")) {
      return {
        // Return placeholder with accessBlocked: true
      };
    }
  }
}
```

### 5. CustomerCard.tsx

**Key Addition:** Access blocked state rendering

```typescript
if (customer.accessBlocked) {
  // Show privacy protected message
  // No action buttons
  // Yellow background alert
}
```

---

## API Calls Summary

### Customer Operations

```
1. submitApplication() → [existing, unchanged]
   ├─ Submits KYC with adminVisible = true (default)

2. setAdminVisibility(_kycId, _visible) → [NEW]
   ├─ Called from AdminVisibilityCard
   ├─ Parameters:
   │  ├─ _kycId: Customer's KYC ID
   │  └─ _visible: true (allow) or false (block)
   └─ Returns: Emits CustomerAdminVisibilitySet event
```

### Admin Operations

```
1. getCustomerAt(index) → [existing, may throw AdminAccessRevoked]
   ├─ Called in loadCustomerAtIndex()
   ├─ Throws: AdminAccessRevoked if adminVisible = false
   └─ Now caught and handled gracefully

2. Customer Card Display → [modified]
   ├─ Checks: customer.accessBlocked flag
   ├─ If true: Show privacy message
   └─ If false: Show normal customer details
```

---

## Visual Differences

### Customer Perspective

**Before:**

```
┌─────────────────────────┐
│   Your KYC Status       │
│                         │
│ KYC ID: KYC-xyz...      │
│ Status: Pending/...     │
└─────────────────────────┘
```

**After:**

```
┌─────────────────────────┐
│   Your KYC Status       │
│                         │
│ KYC ID: KYC-xyz...      │
│ Status: Pending/...     │
└─────────────────────────┘

┌──────── Privacy Control ────────┐
│ 👁️ Visible to Admin              │
│                                  │
│ Admin users can currently view   │
│ your detailed KYC information.   │
│                                  │
│ [🚫 Hide from Admin]             │
└──────────────────────────────────┘
```

### Admin Perspective

**Before:**

```
┌──────────────────────────────────┐
│ John Doe                         │
│ KYC-abc123  [Pending]            │
│                                  │
│ PAN: ABCDE1234F                  │
│ Submitted: Dec 19, 2024          │
│                                  │
│ [👁️ View Details] [✓ Approve]   │
└──────────────────────────────────┘
```

**After (if blocked):**

```
┌─────────────────────────────────────┐
│ ⚠️ Customer Privacy Protected       │
│                                     │
│ This customer has chosen to hide    │
│ their details from admin view.      │
│                                     │
│ ⚠️ The customer has restricted      │
│ admin access to their KYC           │
│ information. They can change this   │
│ setting in their privacy controls   │
│ at any time.                        │
└─────────────────────────────────────┘
```

**After (if accessible - unchanged):**

```
[Same as Before - normal customer card]
```

---

## Transaction Flow

```
Customer clicks "Hide from Admin"
    ↓
AdminVisibilityCard.handleToggleVisibility()
    ↓
getContract(true) → gets signer
    ↓
contract.setAdminVisibility(kycId, false)
    ↓
MetaMask popup for transaction confirmation
    ↓
Transaction sent to blockchain
    ↓
tx.wait() for confirmation
    ↓
UI Updates: "Admin access blocked successfully!"
    ↓
isVisible state set to false
    ↓
Visual indicators update (Eye → EyeOff)
```

---

## Test Cases

### Customer Tests

- [ ] Submit application → See AdminVisibilityCard
- [ ] Initial visibility state is true (visible)
- [ ] Click "Hide from Admin" → Transaction sent
- [ ] After confirmation → UI shows "Hidden from Admin"
- [ ] Status indicator shows Eye-off icon
- [ ] Click "Allow Admin Access" → Restores visibility
- [ ] Multiple toggles work correctly
- [ ] Toast notifications appear correctly

### Admin Tests

- [ ] Dashboard loads even with blocked customers
- [ ] Blocked customers show privacy message
- [ ] Normal customers show full details
- [ ] Cannot view documents of blocked customers
- [ ] Cannot approve/reject blocked customers
- [ ] Refresh dashboard maintains visibility
- [ ] Search/filter works for blocked customers
- [ ] No console errors for AdminAccessRevoked

---

## Known Considerations

1. **Default State**: New applications default to `adminVisible = true`
2. **Blockchain Events**: All visibility changes logged as `CustomerAdminVisibilitySet` events
3. **Instant Effect**: Changes take effect immediately after transaction confirmation
4. **No Data Deletion**: Customer data remains on blockchain, just visibility is controlled
5. **Backward Compatible**: Existing customers unaffected until they change visibility
6. **Admin Cannot Override**: Contract-level enforcement prevents admin bypasses
7. **UI Graceful Degradation**: Admin dashboard continues to function even with some customers blocked
