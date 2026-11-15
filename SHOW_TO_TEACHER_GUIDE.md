# How to Run, Demo & Submit — APAR / ACR System (NIC tran schema)

This version uses your faculty's exact `tran` schema design.

---

> **NOTE:** This build adds employee **self-registration** and an Authority **Add / Manage
> Employees** portal, and new columns (designation, joining date, email, active flag).
> For a fresh local database, run `docker compose up --build`. The command
> `docker compose down -v` permanently deletes the local PostgreSQL data volume; use it
> only when you deliberately want to erase local demo data. Back up any data you need first.

# PART 1 — Run it

1. Have **Docker Desktop** open.
2. In the project folder (where `docker-compose.yml` is):
   ```bash
   docker compose up --build
   ```
3. Open **http://localhost:5173**.

Demo logins (password `Password@123`): `employee@nic.in`, `authority@nic.in`.
The local Docker Compose build enables the demo-account buttons on the login screen.
These accounts are for local demonstrations only and must never be used in production.

> If port 5432/8080 is busy, an old project is still running. Run `docker ps`,
> then `docker stop <name>` and `docker rm <name>` on the old containers.

---

# PART 2 — The demo flow

### The gated APAR flow (the key demo)
1. Log in as the **employee** (`employee@nic.in`). Notice the APAR form is **locked** —
   "No APAR submission has been requested yet." (Keep this tab open.)
2. In another tab, log in as the **authority** (`authority@nic.in`) → **Employees**.
   Tick the checkbox next to Tathagata Laskar → **Send APAR Reminder**.
   (Or use **Notify → Pending APAR → Send reminder**.)
3. Switch back to the employee tab. Within ~10 seconds the **bell shows a notification**
   and the dashboard banner changes to **"APAR submission requested"** with a
   **Fill APAR Report** button — unlocked in near-real-time, no manual refresh.
4. Click **Fill APAR Report**, add targets/achievements, **Submit**.

### Notifications demo
As the authority, open **Notify** and send a message to *all* / a *department* / *selected*
employees. Log in as that employee and open the **bell** to see it with an unread dot.

### Authority assessment (government-style)
Open a submitted APAR → you see the employee's details and targets, and **on the same screen**
you grade (Outstanding → Below Average), add remarks, and can **flag** it. Saving the review
**notifies the employee** automatically.

### As the Authority (`authority@nic.in`)
1. Log in. The dashboard lists **all** submitted ACRs (including the seeded one from Priya).
2. Click the top nav **Employees** to show the full **employee directory** —
   IDs, names, gender (M/F), date of birth, department, office, mobile.
3. Open an ACR → select a **grade**, write **remarks**, optionally tick **Flag** with a reason.
4. **Save Review** → status becomes **Reviewed**.

### New: Register a brand-new employee
On the login screen click **Create an account**, fill the form, and submit it. The account
is created as inactive and waits for approval. Sign in as the Authority, open **Employees**,
find the new employee and activate the account with the power button. The employee can
sign in only after activation.

### New: Authority adds / manages employees
As the Authority, open **Employees** in the top nav → **Add Employee** to create a record
(optionally with a login), and use the power button to **activate/deactivate** accounts.
Pending self-registrations appear as inactive until approved.

### Back as the Employee
Log in again, open your ACR — you now see the grade, remarks, and any flag.

---

# PART 3 — Showing your teacher each layer

## "Show me the DATABASE"
Open a second terminal:
```bash
docker exec -it apar_simple_db psql -U apar_admin -d apar_db
```
Then run these (note everything is in the **tran** schema, matching your design):
```sql
-- show the tables in the tran schema
\dt tran.*

-- the employee master roll
SELECT employee_id, emp_first_name, emp_last_name, gender, date_of_birth, mobile_number
FROM tran.employee_details;

-- ACR submission status
SELECT employee_id, assessment_year, is_acr_submitted, grade, is_flagged
FROM tran.employee_acr_status;

-- targets and achievements
SELECT employee_id, target, achievements FROM tran.employee_acr_details;

-- the lookup tables
SELECT * FROM tran.department;
```
Exit with `\q`.

**Killer move:** submit an ACR in the app while the teacher watches, then re-run the
`employee_acr_status` and `employee_acr_details` queries — the new rows appear live.

## "Show me the BACKEND code"

| File | Say |
|------|-----|
| `backend/.../entity/EmployeeDetails.java` | "Maps to tran.employee_details — the officer master roll." |
| `backend/.../entity/EmployeeAcrStatus.java` | "Maps to tran.employee_acr_status — submission + review state." |
| `backend/.../service/AcrService.java` | "Business logic — submit and review, with role checks." |
| `backend/.../controller/AcrController.java` | "The REST API endpoints." |
| `backend/.../security/SecurityConfig.java` | "JWT login security and role enforcement." |

## "Show me the FRONTEND code"

| File | Say |
|------|-----|
| `frontend/src/pages/SubmitAcr.jsx` | "The employee's ACR submission form." |
| `frontend/src/pages/AcrDetail.jsx` | "Employee info + targets + the authority's grade/flag." |
| `frontend/src/pages/EmployeeDirectory.jsx` | "The authority's employee directory." |
| `frontend/src/api/api.js` | "How the frontend calls the backend." |

## Tie it together (say this)
> "Sir, the schema follows the NIC design you gave us — the `tran` schema with
> employee_details, employee_acr_status, and employee_acr_details, plus lookup tables
> for organization, office and department. When an employee submits, React posts to the
> Spring Boot API, which writes target/achievement rows into employee_acr_details and
> flips is_acr_submitted to true in employee_acr_status. The authority then grades and
> can flag it, which updates the same status row. Login is JWT-based and kept separate
> in user_account, so HR data and credentials are decoupled."

---

# PART 4 — GitHub + Submit

```bash
cd apar-simple
git init
git add .
git commit -m "APAR/ACR system on NIC tran schema"
git branch -M main
git remote add origin https://github.com/<your-username>/apar-acr.git
git push -u origin main
```
(If asked for a password, use a GitHub token: Settings → Developer settings →
Personal access tokens → Generate, tick `repo`, paste it as the password.)

Submit the repo link, or zip it:
```bash
cd ..
zip -r apar-acr.zip apar-simple -x "*/node_modules/*" -x "*/target/*" -x "*/dist/*" -x "*/.env"
```

---

# IMPORTANT — be ready to explain
Before the demo, read `AcrService.java`, `AcrController.java`, and the three React pages,
and make sure you can explain submit, review, and the tran-schema mapping in your own words.
Understanding it matters more than the demo running.
