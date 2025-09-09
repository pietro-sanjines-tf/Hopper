Digital Business Card Generator
================================

Project Goal
------------
Serverless web app to create a digital business card with a QR code that encodes a vCard. The card can be downloaded as a PDF and optionally saved locally or shared via a generated link. Runs entirely in the browser using pure HTML, CSS, and JavaScript.

How to Run
----------
- Simply open `index.html` in your browser.
- Alternatively, serve the folder (optional): `python3 -m http.server 8000` then open `http://localhost:8000`.

Features
--------
- User input form: Full Name, Company, Title, Phone, Email
- vCard generation (VCF 3.0)
- QR code generation and display on the card
- Clean/Dark templates, optional logo upload
- Export card as PDF (preserves layout and QR)
- Save multiple cards locally and reload them
- Share via generated URL query params (client-side only)

Libraries (CDN)
---------------
- QRCode: `https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js`
- html2canvas: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`
- jsPDF: `https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js`

Project Structure
-----------------
- `index.html` — markup and script/style includes
- `style.css` — layout and card styling
- `script.js` — client-side logic (vCard, QR, PDF, save/share)

Notes
-----
- Minimal validation: Full Name and Phone required; Email format checked if present.
- All functionality is client-side; no package managers or backend required.

