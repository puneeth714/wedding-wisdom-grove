# Backend Changes for Manual Bookings

This document outlines the necessary backend changes in Supabase to support manual bookings created by vendors.

## 1. Row Level Security (RLS) Policies

The RLS policies on the `bookings` table need to be updated to allow vendors and their staff to access both platform bookings and the manual bookings they create.

### `bookings` Table RLS

**Existing `SELECT` Policy for Vendors:**

The existing policy likely looks something like this:

```sql
(vendor_id = (SELECT vendor_id FROM public.vendor_staff WHERE supabase_auth_uid = auth.uid()))
```

**Updated `SELECT` Policy:**

This policy should remain largely the same, as it correctly scopes bookings to the vendor. No changes are strictly necessary for the `SELECT` policy, but it's important to verify it.

**`INSERT` Policy:**

The insert policy should allow staff members to create bookings for their own vendor.

```sql
(vendor_id = (SELECT vendor_id FROM public.vendor_staff WHERE supabase_auth_uid = auth.uid()))
```

**`UPDATE` Policy:**

The update policy should allow staff to update bookings for their vendor.

```sql
(vendor_id = (SELECT vendor_id FROM public.vendor_staff WHERE supabase_auth_uid = auth.uid()))
```

## 2. Commission Logic

Any backend function or scheduled job that calculates platform commissions must be updated to exclude manual bookings.

**Example `calculate_commissions` Function:**

If you have a function that calculates commissions, it should be updated to filter by `booking_source`.

**Before:**

```sql
SELECT
  b.vendor_id,
  SUM(b.total_amount * v.commission_rate) as total_commission
FROM
  bookings b
JOIN
  vendors v ON b.vendor_id = v.vendor_id
WHERE
  b.booking_status = 'completed'
GROUP BY
  b.vendor_id;
```

**After:**

```sql
SELECT
  b.vendor_id,
  SUM(b.total_amount * v.commission_rate) as total_commission
FROM
  bookings b
JOIN
  vendors v ON b.vendor_id = v.vendor_id
WHERE
  b.booking_status = 'completed'
  AND b.booking_source = 'platform' -- Exclude manual bookings
GROUP BY
  b.vendor_id;
```

## 3. Review System

The logic that triggers a review request after a booking is completed needs to be updated.

**Example Trigger `on_booking_completed`:**

If you have a trigger that creates a review request, it should be modified to only fire for platform bookings.

```sql
-- In the trigger function that handles completed bookings
IF NEW.booking_status = 'completed' AND OLD.booking_status != 'completed' AND NEW.booking_source = 'platform' THEN
  -- Logic to insert into a 'review_requests' table or send a notification
END IF;
```

## 4. Notification System

Any triggers or functions that send notifications to customers (e.g., booking confirmations, reminders) must check if `user_id` is present.

**Example Trigger `on_booking_confirmation`:**

```sql
-- In the trigger function that sends a confirmation
IF NEW.booking_status = 'confirmed' AND OLD.booking_status != 'confirmed' AND NEW.user_id IS NOT NULL THEN
  -- Logic to insert into the 'notifications' table for the user
  INSERT INTO public.notifications (recipient_user_id, message, ...)
  VALUES (NEW.user_id, 'Your booking is confirmed!', ...);
END IF;