repo: CerciMuh/therapyjo_proposal
branch: master
path: (whole repo)

## Last sync
date: 2026-08-09T17:07:55Z

### Updated in this project
- Redesigned public landing page (elevated visual system, same teal/navy palette, EN/AR bilingual toggle)
- Added Doctors/Team section (grid, real photo for head doctor + placeholder slots for growing team)
- Added public Blog section + single-post view (sample physiotherapy articles)
- Added Google Reviews section (placeholder rating/reviews pending live data)
- Extended admin dashboard with a Blog CMS and a Doctors CMS (photos, bios, specialties), gated to the head doctor's account

## Screen map
| Project screen | Repo source files |
|---|---|
| Landing Page.dc.html | src/app/page.tsx, src/app/components/{Navbar,Hero,About,Services,Staff,Location,ContactCTA,Footer,WhatsAppFloat}.tsx, src/app/globals.css, src/app/i18n/translations.ts, public/logo.jpg, public/noor_hamami_head_doctor.jpg, public/icons/*, public/{cupping,theragun,joint-manipulation}.webp |
| Admin Dashboard.dc.html | src/app/admin/layout.tsx, src/app/admin/page.tsx, src/app/admin/employees/doctors/page.tsx, src/app/globals.css |
