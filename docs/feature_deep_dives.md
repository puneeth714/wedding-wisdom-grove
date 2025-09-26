# Application Feature Deep Dives

This document provides detailed, step-by-step internal flows for each major feature of the application for both Vendors and Staff.

---

## 1. Vendor Service Management

This flow details how a vendor adds, edits, and removes the services their business offers.

```mermaid
graph TD
    subgraph "Feature: Vendor Service Management"
        A[Vendor navigates to 'Services' page] --> B{A list of existing services is displayed};
        B --> C[Clicks the 'Add Service' button];
        C --> D[A blank form appears to define the new service];
        D --> E{Vendor fills the form and submits};
        E -- Success --> F[A new entry is created in the database's 'services' table];
        F --> G[The service list on the page updates to show the new service];
        E -- Validation Error --> H[An error message is displayed on the form];

        B --> I[Clicks 'Edit' on an existing service];
        I --> J[The form appears, pre-filled with that service's data];
        J --> K{Vendor modifies the form and submits};
        K -- Success --> L[The service's record is updated in the database];
        L --> M[The service list updates with the new information];
        K -- Validation Error --> N[An error message is displayed on the form];

        B --> O[Clicks 'Delete' on a service];
        O --> P{A confirmation dialog asks to confirm the action};
        P -- Confirms --> Q[The service record is removed from the database];
        Q --> R[The service list updates];
    end
```

---

## 2. Vendor Booking Management

This flow outlines how a vendor manages incoming bookings, assigns staff, and updates booking statuses.

```mermaid
graph TD
    subgraph "Feature: Vendor Booking Management"
        A[Vendor navigates to 'Bookings' page] --> B{A list of all bookings is displayed};
        B --> C[Clicks on a specific booking];
        C --> D[A detailed view of the booking opens];
        D --> E[Can view customer details, service requested, date/time];
        D --> F{Assign staff to booking};
        F --> G[Selects a staff member from a dropdown];
        G --> H[Booking record is updated with the assigned staff_id];
        D --> I{Update booking status};
        I --> J[Selects new status (e.g., 'Confirmed', 'Completed', 'Cancelled')];
        J --> K[Booking record status is updated in the database];
        D --> L[Add notes to the booking];
        L --> M[Enters text into a notes field and saves];
        M --> N[Note is added to the booking record];
    end
```

---

## 3. Vendor Task Management

This flow shows how a vendor creates tasks and assigns them to staff or bookings.

```mermaid
graph TD
    subgraph "Feature: Vendor Task Management"
        A[Vendor navigates to 'Tasks' page] --> B{A list of tasks is displayed};
        B --> C[Clicks 'Create Task'];
        C --> D[A form opens to create a new task];
        D --> E[Enters task description, due date, and assigns to a booking or staff member];
        E --> F{Submits the task form};
        F --> G[A new record is created in the 'tasks' table];
        G --> H[The task list refreshes];

        B --> I[Clicks on an existing task];
        I --> J{Can mark task as complete};
        J --> K[Task status is updated in the database];
        I --> L{Can edit task details};
        L --> M[Form loads with task data, vendor makes changes and saves];
        M --> N[Task record is updated];
    end
```

---

## 4. Staff Availability Management

This flow details how staff members manage their work schedules.

```mermaid
graph TD
    subgraph "Feature: Staff Availability Management"
        A[Staff member navigates to 'Availability' page] --> B{An availability calendar is displayed};
        B --> C[Clicks on a specific date or time slot];
        C --> D{Marks slot as 'Available' or 'Unavailable'};
        D --> E[An entry is created/updated in the 'staff_availability' table];
        E --> F[The calendar UI updates to reflect the change];
        
        B --> G[Can set recurring availability];
        G --> H[Selects a time range and days of the week];
        H --> I[Multiple availability records are created in the database];
    end
```

---

## 5. Staff Task Management

This flow shows how a staff member views and updates the tasks assigned to them.

```mermaid
graph TD
    subgraph "Feature: Staff Task Management"
        A[Staff member navigates to 'Tasks' page] --> B{A list of tasks assigned to them is displayed};
        B --> C[Clicks on a task to view details];
        C --> D[Can see task description, due date, and related booking];
        C --> E{Marks task as 'In Progress' or 'Completed'};
        E --> F[Task status is updated in the database];
        F --> G[The task list UI updates];
    end
```

---

## 6. Staff Profile & Portfolio Management

This flow outlines how a staff member can manage their personal information and professional portfolio.

```mermaid
graph TD
    subgraph "Feature: Staff Profile & Portfolio Management"
        A[Staff member navigates to 'Profile' or 'Settings' page] --> B{Their current profile information is displayed};
        B --> C[Clicks 'Edit Profile'];
        C --> D[Can update personal details like name and phone number];
        D --> E[Information is updated in the 'vendor_staff' table];

        B --> F[Navigates to 'Manage Portfolio' section];
        F --> G{A list of portfolio items is displayed};
        G --> H[Can add a new portfolio item];
        H --> I[Fills out a form with title, description, and images/videos];
        I --> J[A new record is created in the 'staff_portfolios' table];
        
        G --> K[Can edit an existing portfolio item];
        K --> L[Form loads with existing data, staff member makes changes and saves];
        L --> M[Portfolio record is updated];
    end
```
