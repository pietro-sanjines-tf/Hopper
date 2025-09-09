// script.js — client-side only. No build step.

// Element references
const form = document.getElementById('cardForm');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('downloadPdf');
const generateQrBtn = document.getElementById('generateQr');
const saveBtn = document.getElementById('saveLocal');
const shareBtn = document.getElementById('shareLink');

const inputFullName = document.getElementById('fullName');
const inputCompany = document.getElementById('company');
const inputTitle = document.getElementById('title');
const inputPhone = document.getElementById('phone');
const inputEmail = document.getElementById('email');
const inputTemplate = document.getElementById('template');
const inputLogo = document.getElementById('logo');

const card = document.getElementById('business-card');
const cardLogo = document.getElementById('card-logo');
const cardName = document.getElementById('card-name');
const cardCompany = document.getElementById('card-company');
const cardTitle = document.getElementById('card-title');
const cardPhone = document.getElementById('card-phone');
const cardEmail = document.getElementById('card-email');
const qrCanvas = document.getElementById('qr-canvas');

const savedList = document.getElementById('savedList');

// Utilities
function sanitize(text) {
    if (!text) return '';
    return String(text).replace(/\r|\n/g, ' ').trim();
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function buildVcard({ fullName, company, title, phone, email }) {
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:;${fullName};;;`,
        `FN:${fullName}`
    ];
    if (company) lines.push(`ORG:${company}`);
    if (title) lines.push(`TITLE:${title}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    lines.push('END:VCARD');
    return lines.join('\n');
}

async function generateQR(vcardStr) {
    try {
        if (!window.QRCode) {
            console.error('QRCode library not loaded');
            return false;
        }
        const options = { errorCorrectionLevel: 'M', margin: 1, width: 200 };
        // Prefer rendering directly to canvas for reliability
        await new Promise((resolve, reject) => {
            QRCode.toCanvas(qrCanvas, vcardStr, options, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        return true;
    } catch (error) {
        console.error('QR generation failed', error);
        return false;
    }
}

function getCurrentInputs() {
    return {
        fullName: sanitize(inputFullName.value),
        company: sanitize(inputCompany.value),
        title: sanitize(inputTitle.value),
        phone: sanitize(inputPhone.value),
        email: sanitize(inputEmail.value),
        template: inputTemplate.value || 'clean'
    };
}

async function updatePreview() {
    const values = getCurrentInputs();
    cardName.textContent = values.fullName || 'Full Name';
    cardCompany.textContent = values.company || 'Company';
    cardTitle.textContent = values.title || 'Title';
    cardPhone.textContent = values.phone || '+0 000 000 000';
    cardEmail.textContent = values.email || 'email@example.com';
    card.className = 'card ' + (values.template || 'clean');

    const file = inputLogo.files && inputLogo.files[0];
    if (file) {
        const dataUrl = await readFileAsDataURL(file);
        cardLogo.src = dataUrl;
        cardLogo.style.display = 'block';
    } else {
        cardLogo.src = '';
        cardLogo.style.display = 'none';
    }

    const vcard = buildVcard(values);
    await generateQR(vcard);
}

function validate() {
    if (!inputFullName.value.trim()) {
        alert('Full Name is required');
        inputFullName.focus();
        return false;
    }
    if (!inputPhone.value.trim()) {
        alert('Phone Number is required');
        inputPhone.focus();
        return false;
    }
    if (inputEmail.value && !/^\S+@\S+\.\S+$/.test(inputEmail.value)) {
        alert('Please enter a valid email address');
        inputEmail.focus();
        return false;
    }
    return true;
}

async function handleGenerate() {
    if (!validate()) return;
    await updatePreview();
}

async function handleDownloadPdf() {
    if (!validate()) return;
    await updatePreview();
    const node = document.getElementById('business-card');
    const scale = 2;
    const canvas = await html2canvas(node, { scale });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const values = getCurrentInputs();
    const filename = (values.fullName ? values.fullName.replace(/\s+/g, '_') : 'business_card') + '.pdf';
    pdf.save(filename);
}

function renderSavedList() {
    const items = JSON.parse(localStorage.getItem('savedCards') || '[]');
    savedList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        const left = document.createElement('div');
        left.textContent = `${item.fullName || 'Unnamed'} — ${item.company || ''}`.trim();
        const right = document.createElement('div');
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', async () => {
            inputFullName.value = item.fullName || '';
            inputCompany.value = item.company || '';
            inputTitle.value = item.title || '';
            inputPhone.value = item.phone || '';
            inputEmail.value = item.email || '';
            inputTemplate.value = item.template || 'clean';
            if (item.logoDataUrl) {
                cardLogo.src = item.logoDataUrl;
                cardLogo.style.display = 'block';
            }
            await updatePreview();
        });
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => {
            const next = JSON.parse(localStorage.getItem('savedCards') || '[]');
            next.splice(index, 1);
            localStorage.setItem('savedCards', JSON.stringify(next));
            renderSavedList();
        });
        right.appendChild(loadBtn);
        right.appendChild(delBtn);
        li.appendChild(left);
        li.appendChild(right);
        savedList.appendChild(li);
    });
}

async function handleSaveLocal() {
    if (!validate()) return;
    await updatePreview();
    const values = getCurrentInputs();
    let logoDataUrl = '';
    if (cardLogo && cardLogo.src) logoDataUrl = cardLogo.src;
    const item = { ...values, logoDataUrl, savedAt: Date.now() };
    const items = JSON.parse(localStorage.getItem('savedCards') || '[]');
    items.unshift(item);
    localStorage.setItem('savedCards', JSON.stringify(items.slice(0, 50)));
    renderSavedList();
    alert('Saved locally');
}

function buildShareUrl() {
    const values = getCurrentInputs();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => { if (v) params.set(k, v); });
    const url = `${location.origin}${location.pathname}?${params.toString()}`;
    return url;
}

async function handleShare() {
    if (!validate()) return;
    await updatePreview();
    const url = buildShareUrl();
    try {
        await navigator.clipboard.writeText(url);
        alert('Share link copied to clipboard');
    } catch {
        prompt('Copy this link:', url);
    }
}

function applyFromUrl() {
    const params = new URLSearchParams(location.search);
    if (!params.keys().next().value) return;
    inputFullName.value = params.get('fullName') || '';
    inputCompany.value = params.get('company') || '';
    inputTitle.value = params.get('title') || '';
    inputPhone.value = params.get('phone') || '';
    inputEmail.value = params.get('email') || '';
    inputTemplate.value = params.get('template') || 'clean';
}

// Wire up events
generateBtn.addEventListener('click', handleGenerate);

downloadBtn.addEventListener('click', handleDownloadPdf);

saveBtn.addEventListener('click', handleSaveLocal);

shareBtn.addEventListener('click', handleShare);

// Generate-only QR button (reuses full update flow)
generateQrBtn.addEventListener('click', async () => {
    if (!validate()) return;
    await updatePreview();
});

// Live update card on input changes
[inputFullName, inputCompany, inputTitle, inputPhone, inputEmail, inputTemplate].forEach(el => {
    el.addEventListener('input', updatePreview);
});
inputLogo.addEventListener('change', updatePreview);

// Init on load
applyFromUrl();
updatePreview();
renderSavedList();