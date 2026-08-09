### 1) Entry point: Admin Login

- **Role:** Admin
- **Goal:** Access the clinic management dashboard

---

### 2) Main layout (after login)

**Top Navbar**

- **Dashboard**
- **Employees** (dropdown)
    - View Doctors
    - View Secretaries
- **Patients File** (dropdown)
    - Add Patients
    - View Patients
    - View Archived Patients
    - Check Dupe Patients
- **Notes** (dropdown)
    - *(Clarify what “Notes” contains: general notes, patient notes, session notes, or internal staff notes.)*

---

### 3) Dashboard (Reservations Calendar)

#### 3.1 Controls (top of dashboard)

- **Doctor filter** dropdown: filter reservations by *each doctor*
- **Add Reservation** button
    - Constraint: **existing patient only** (no new-patient creation from this flow)
- Quick navigation buttons:
    - **Yesterday**
    - **Today**
    - **Tomorrow**

#### 3.2 Calendar view (day schedule)

- **Time axis (Y):** 9:00 AM → 6:00 PM
- **Schedule grid:** daily reservations shown in time slots
- **Color coding:** each reservation is color-coded by **doctor**
- **Doctor legend/index:** shows each doctor with their corresponding color
- three dots have checkin Entry To Doctor checkout, dupe session, waiting, delete session
- reservation slot shows name + phone number of patient

#### 3.3 Date navigation (calendar picker)

- A month/date picker to jump between days
- Each date cell shows **number of reservations** for that day

#### 3.4 Reservation slot actions (inside each slot)

Each reservation slot supports:

- **Check-in**
- **Entry to Doctor** (start session)
- **Checkout** (end session)
- **Waiting** (status)
- **Duplicate session** *(unclear: copy reservation to another time/date?)*
- **Delete session**

<aside>
⚠️

Consider adding a confirmation step for **Delete session** and an audit log entry.

</aside>

---

### 4) Add / Edit Reservation (Reservation Details)

When creating or opening a reservation, show:

- **Patient Name**
- **Patient Phone 1**
- **Patient Phone 2**
- **Session Date** (calendar input)
- **Doctor preference** (selection)
- **Note**
    - Includes a flag: **“Show on calendar”** (yes/no)
- **Next session note**
- **Note from previous session**
    - Rule: fetch from the **most recent previous session** for this patient

---

### 5) Employees menu

## 5.1 Employees → View Doctors

#### Doctors list (table)

Each row shows:

- **Employment status** (Active, Resigned)
- **Name**
- **Phone**
- **Email**
- **Working hours** (time data type)
- Actions:
    - **Edit**
    - **Delete**

#### Add Doctor (form)

Fields:

- **Status:** Active, Resigned
- **Doctor name**
- **Phone**
- **Email**
- **Working hours**
- **Credentials**
    - Username
    - Password
- **Color** (for reservation color-coding)
- **Picture upload**
    - Requirement: **convert to WebP**
- **Save** button

#### Edit Doctor (form)

Same fields as Add Doctor.

#### Delete Doctor

- Marked as **catastrophic** in notes
- Recommendation: use **soft delete** or force **status = Resigned** instead of permanent deletion

---

## 5.2 Employees → View Secretaries

#### Secretaries list (table)

Each row shows:

- **Status** (Active, Resigned)
- **Name**
- **Phone**
- **Email**
- **Working hours**
- Action:
    - **Edit**

#### Edit Secretary (form)

Fields:

- **Status:** Active, Resigned
- **Secretary name**
- **Phone**
- **Email**
- **Working hours**
- **Credentials**
    - Username
    - Password
- **Picture upload**
    - Requirement: **convert to WebP**
- **Save** button

---

### 6) Patients File

## 6.1 Patients → Add Patient

**Add Patient (form)**

- **Patient name**
- **Phone 1**
- **Phone 2**
- **Picture upload**
    - Requirement: **convert to WebP**
- **Patient files** *(unclear: documents/images? multiple uploads?)*
- **Save**

## 6.2 Patients → View Patients

**View Patients (paginated table)**

Columns / actions:

- **Patient ID** (auto-increment, +1 per new patient)
    - Rule: check for duplicates before creating a new patient
- **Name**
- **Phone** (display primary phone, optionally show both)
- **Last visit date**
- **View** button
- **Archive** button

### Patient profile → View (details page)

**Profile header**

- **Patient name**
- **Phone 1 + Phone 2**
    - With **call action** (tap/click to call)
- **Last visit date**
    - Update rule: can be updated after the patient is **checked in** from the calendar
- **Patient files** (attachments)
- **Update patient** button

#### Section A — Clinical intake / assessment

- **Injury place**
    - Option 1: manual entry
    - Option 2: dropdown from a pre-filled list
- **Reservation enroll date**
- **Medical history**
- **Assessment**
- **What movements trigger (aggravate) pain**
- **What relieves pain**
- **Diagnosis**
- **Treatment plan**
- **Recommended number of sessions**
- **Clinic exercises**
- **Home exercises**
- **Next session treatment**
- **Update assessment** button

#### Section B — Session history

**Sessions table** (per patient)

- Columns: **Session name**, **Doctor**, **Date**, **Time**, **Injury place**, **Payment type**, **View**

#### Session → View / Edit

Fields / controls:

- **Status controls:** Check-in, Entry to Doctor, Checkout
    - *(Clarify what data each status change stores. Example: timestamp + staff member.)*
- **Patient name** (read-only)
- **Phone 1, Phone 2**
- **Session date**
- **Session time**
- **Doctor** (dropdown)
- **Payment type** (dropdown: Cash, Insurance)
- **Is two hours** (checkbox)
- **Is note** (checkbox)
- **Next session note**
- **Update** button

## 6.3 Patients → Search

- **Search patient** by **name**

## 6.4 Patients → Duplicates & archive

- **Check duplicate patients** (dedupe workflow)
- **View archived patients**

---

### 7) Notes

## 7.1 Notes → Add Note

**Add Note (form)**

- **Note name**
- **Note date**
- **Doctor** (dropdown of doctors)
- **Doctor checknote** (checkbox)
- **Note details** (text)
- **Save**

## 7.2 Notes → View Notes

**View Notes (table)**

- **Add Note** button
- Table columns / actions:
    - **Note name**
    - **Note date**
    - **Doctor**
    - **Edit**
    - **Delete**

---

### 8) Secretary Dashboard (Role-based flow)

#### 8.1 Secretary Navbar

- **Dashboard**
- **Patients File**
- **Notes**

#### 8.2 Secretary → Dashboard (Reservations)

- Can **add a reservation** (same reservation details as Admin)
- Same dashboard layout as Admin:
    - Daily calendar grid
    - Date picker
    - Doctor filter
    - Doctor color-coded legend/index
    - Reservation slot actions (check-in / entry to doctor / checkout / etc.)
    - three dots have checkin Entry To Doctor checkout, dupe session, waiting, delete session
    - reservation slot shows name + phone number of patient

<aside>
🔒

If secretaries should have fewer permissions than Admin, define which slot actions are allowed (e.g., allow Check-in but disallow Delete session).

</aside>

#### 8.3 Secretary → Patients File

Secretary can access only:

- **Add Patient**
- **View Patients**

#### Add Patient (Secretary)

- **Patient name**
- **Phone 1**
- **Phone 2**
- **Upload files**
- **Patient picture**
    - Requirement: **convert to WebP**

#### View Patients (Secretary)

- Same as Admin *view* experience, with restrictions.

**Patient profile → View (Secretary restrictions)**

- No full clinical field editing (read-only for assessment/treatment fields)
- Can view patient files (read-only)
- Can view last patient session details

**Allowed updates (Secretary)**

- Can update basic patient info:
    - **Patient name**
    - **Phone numbers**

#### 8.4 Secretary → Notes

- **Add Note** and **View Notes**
- Same details as Admin Notes flow

---

### 9) Doctor View (Role-based flow)

#### 9.1 Navigation / entry

- No full navbar
- Primary entry is a **patient search** experience:
    - Shows all patients
    - Supports search/filtering by patient

#### 9.2 Doctor → Dashboard (Reservations)

- Same calendar layout as Admin/Secretary (9 AM–6 PM schedule, color-coded by doctor)
- **Cannot add a reservation**

**Reservation block (3-dot menu) actions**

- **Update injury place**
- **Duplicate session**
- **Waiting**
- **Delete session**

#### 9.3 Doctor → Session Details (open by clicking a reservation)

When the doctor opens a reservation slot, show **Session Details**:

- Editable fields:
    - **Session date**
    - **Session time**
    - **Doctor**
    - **Patient name** *(confirm: should a doctor be allowed to rename a patient?)*
- Readable context:
    - **Patient file** (patient profile details)
    - **All previous sessions** for this patient - View Button to update SOAP

#### 9.4 SOAP note (physio)

Indicate whether session documentation uses **SOAP**:

- **S**: Subjective
- **O**: Objective
- **A**: Assessment
- **P**: Plan

---

### Open questions / items to clarify

- What exactly are **Patient files** (allowed file types, max files, per patient vs per session)?
- Define the **duplicate check rule** (same phone? same name + phone? same national ID?)
- For **Check-in / Entry to Doctor / Checkout**, what should be stored (timestamps, staff member, notes, billing triggers)?
- Should **Last visit date** be auto-derived from the latest completed session instead of manually updated?
- What is **Notes** (separate module) vs reservation/session notes?
- What does **“Duplicate session”** do exactly?
- Should “Entry to Doctor / Checkout / Waiting / Check-in” be a single **session status** state machine?