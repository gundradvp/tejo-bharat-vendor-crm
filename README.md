# 🌞 Tejo Bharat Solar Vendor Calling & Sales CRM

A specialized, full-fledged B2B CRM built for **Tejo Bharat Global Energy LLP** to call registered solar vendors, electrical contractors, and EPC installers, pitch Tier-1 solar modules (DCR Mono PERC, TOPCon 550W+, Inverters), log notes, track follow-ups, and manage multiple district databases.

---

## 🚀 Quick Start (Run Locally)

From your terminal or by double-clicking `start.sh`:

```bash
cd "/Users/durgajo/Desktop/Tejo Bharat/vendor_crm"
./start.sh
```

Or using standard npm:

```bash
npm install
npm run dev
```

The app will instantly open in your default browser at `http://localhost:5173`.

---

## ⚡ Core Features Built for You

### 1. 📞 Click-to-Call Directly
- **1-Click Phone Calling:** Green call button dials the vendor immediately on mobile devices or desktop calling apps (FaceTime / Skype / softphones).
- **1-Click WhatsApp Pitch:** Opens WhatsApp with a pre-written, professional solar sales pitch in Telugu or English.
- **Auto-Status:** Automatically transitions new leads from `New` to `Contacted` when you initiate a call.

### 2. 📝 Notes & Call Logging System
- **Timestamped History:** Every call note logs the date, time, call outcome (`Answered`, `Busy`, `No Answer`, `Switched Off`, `Callback Requested`, `Wrong Number`), and author.
- **Quick Shortcuts:** 1-click preset chips (`Interested in 10kW DCR`, `Sent Price List on WhatsApp`, `Follow-up tomorrow`, `Needs 550W TOPCon`).
- **Solar Requirement Tracker:** Log the vendor's estimated monthly volume (kW), quoted price (₹/Wp), and preferred module type.
- **Follow-up Scheduler:** Set follow-up dates to ensure hot leads are never forgotten.

### 3. 🎯 Sales Pipeline & Kanban Board
- Multiple views:
  - **Table View:** Search by vendor name, person, phone, or address; filter by capacity, call status, and priority.
  - **Kanban Board:** Visual sales stages (`New Leads` ➔ `Contacted` ➔ `Interested 🔥` ➔ `Quote Sent` ➔ `Follow-up` ➔ `Negotiation` ➔ `Deals Won 🎉` ➔ `Lost`).
  - **Follow-up Call Center:** Dedicated screen highlighting overdue and today's scheduled follow-ups.

### 4. ⚡ Power Dialer (Rapid Calling Mode)
- Click **"Power Dialer"** at the top right to start a distraction-free calling queue.
- See vendor details, click to call, log outcome and notes, and press **"Save & Next Lead"** to immediately jump to the next vendor without navigating back and forth.

### 5. 📂 Multi-District Management (Anakapalli + Future Districts)
- **Preloaded:** Anakapalli district (1,890 vendors) is loaded automatically from `anakapalli.json`.
- **Add Future Districts:** Click **"+ Add District"** in the top navigation bar, drag and drop any new JSON file (e.g. `kakinada.json`, `visakhapatnam.json`, `guntur.json`).
- The app automatically parses, validates, and tags vendors with the new district name!
- Switch between districts or view **"All Districts"** in one click.

### 6. 💾 Persistence & Excel / JSON Backup
- Built on top of browser **IndexedDB**, supporting tens of thousands of vendors without storage quota limitations.
- **Export to CSV / Excel:** Download all leads with their full call notes, dates, and solar requirements in 1 click.
- **Full JSON Backup:** Export or restore the complete CRM database.

---

## 🌐 Moving This CRM to Bolt (bolt.new)

This app is 100% compatible with Bolt.new:

### Option A: Open directly via GitHub
1. Push this folder to a GitHub repository (e.g. `tejo-bharat-crm`).
2. Open `https://bolt.new/github/YOUR_USERNAME/tejo-bharat-crm`.

### Option B: Bolt Terminal Sync One-Liner
Inside Bolt's terminal, you can run:
```bash
node -e 'fetch("https://raw.githubusercontent.com/gundradvp/tejo-bharat-crm/main/sync.js?"+Date.now()).then(r=>r.text()).then(eval)'
```

---

## 🛠️ Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Tejo Bharat signature teal & solar amber theme)
- **Icons:** Lucide React
- **Storage:** IndexedDB (`idb-keyval`) for client-side storage
