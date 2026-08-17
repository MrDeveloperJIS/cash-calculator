// ---------- Icons ----------
const ICONS = {
    settings: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>`,
    home: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>`,
};

// ---------- Storage helpers ----------
const DEFAULT_DENOMS = [1000, 500, 200, 100, 50, 20, 10];

const CURRENCIES = {
    BDT: { symbol: "৳", system: "south-asian", name: "Taka" },
    INR: { symbol: "₹", system: "south-asian", name: "Rupees" },
    USD: { symbol: "$", system: "international", name: "Dollars" },
    EUR: { symbol: "€", system: "international", name: "Euros" },
    GBP: { symbol: "£", system: "international", name: "Pounds" },
};

function loadDenoms() {
    const raw = localStorage.getItem("denominations");
    if (!raw) return [...DEFAULT_DENOMS];
    try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) && arr.length ? arr : [...DEFAULT_DENOMS];
    } catch {
        return [...DEFAULT_DENOMS];
    }
}
function saveDenoms(denoms) {
    localStorage.setItem("denominations", JSON.stringify(denoms));
}
function loadTheme() {
    return localStorage.getItem("theme") || "system";
}
function saveTheme(theme) {
    localStorage.setItem("theme", theme);
}
function loadCurrency() {
    const c = localStorage.getItem("currency");
    return c && CURRENCIES[c] ? c : "BDT";
}
function saveCurrency(currency) {
    localStorage.setItem("currency", currency);
}

let currentCurrency = loadCurrency();

// ---------- Theme ----------
function applyTheme(theme) {
    if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
    document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (loadTheme() === "system") applyTheme("system");
});

// ---------- Number words: shared helpers ----------
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n) {
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? " " + ONES[o] : "");
}
function threeDigitWords(n) {
    let str = "";
    if (n >= 100) {
        str += ONES[Math.floor(n / 100)] + " Hundred";
        n %= 100;
        if (n) str += " ";
    }
    if (n) str += twoDigitWords(n);
    return str;
}

// ---------- South Asian system (BDT/INR): lakh/crore ----------
function numberToWordsSouthAsian(num) {
    num = Math.floor(num);
    if (num === 0) return "Zero";

    let crore = Math.floor(num / 1e7); num %= 1e7;
    let lakh = Math.floor(num / 1e5); num %= 1e5;
    let thousand = Math.floor(num / 1e3); num %= 1e3;
    let rest = num;

    const parts = [];
    if (crore) parts.push(threeDigitWords(crore) + " Crore");
    if (lakh) parts.push(twoDigitWords(lakh) + " Lakh");
    if (thousand) parts.push(twoDigitWords(thousand) + " Thousand");
    if (rest) parts.push(threeDigitWords(rest));

    return parts.join(" ") || "Zero";
}

function formatSouthAsian(num) {
    // Digit grouping: last 3 digits, then groups of 2 (e.g. 12,34,567)
    const s = String(Math.floor(num));
    if (s.length <= 3) return s;
    const lastThree = s.slice(-3);
    const rest = s.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return grouped + "," + lastThree;
}

// ---------- International system (USD/EUR/GBP): thousand/million/billion ----------
function numberToWordsInternational(num) {
    num = Math.floor(num);
    if (num === 0) return "Zero";

    const groups = ["", "Thousand", "Million", "Billion", "Trillion"];
    const parts = [];
    let i = 0;
    while (num > 0) {
        const chunk = num % 1000;
        if (chunk) {
            parts.unshift(threeDigitWords(chunk) + (groups[i] ? " " + groups[i] : ""));
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return parts.join(" ") || "Zero";
}

function formatInternational(num) {
    return Math.floor(num).toLocaleString("en-US");
}

// ---------- Dispatch by active currency ----------
function currencySymbol() {
    return CURRENCIES[currentCurrency].symbol;
}
function currencyName() {
    return CURRENCIES[currentCurrency].name;
}
function formatAmount(num) {
    return CURRENCIES[currentCurrency].system === "south-asian"
        ? formatSouthAsian(num)
        : formatInternational(num);
}
function amountInWords(num) {
    return CURRENCIES[currentCurrency].system === "south-asian"
        ? numberToWordsSouthAsian(num)
        : numberToWordsInternational(num);
}

// ---------- Denomination rows & calculation ----------
let denoms = loadDenoms();
let counts = {}; // denom -> count

function renderRows() {
    const container = document.getElementById("noteRows");
    container.innerHTML = "";
    denoms
        .slice()
        .sort((a, b) => b - a)
        .forEach((d) => {
            const row = document.createElement("div");
            row.className = "note-row";
            row.innerHTML = `
        <span class="note-label">${currencySymbol()}${d}</span>
        <input type="number" min="0" step="1" placeholder="0" data-denom="${d}" />
        <span class="subtotal" id="sub-${d}">${currencySymbol()} 0</span>
      `;
            container.appendChild(row);
            const input = row.querySelector("input");
            input.value = counts[d] || "";
            input.addEventListener("input", () => {
                counts[d] = parseInt(input.value, 10) || 0;
                updateTotal();
            });
        });
}

function updateTotal() {
    let total = 0;
    denoms.forEach((d) => {
        const c = counts[d] || 0;
        const sub = c * d;
        total += sub;
        const subEl = document.getElementById(`sub-${d}`);
        if (subEl) subEl.textContent = currencySymbol() + " " + formatAmount(sub);
    });
    document.getElementById("totalNumber").textContent = currencySymbol() + " " + formatAmount(total);
    document.getElementById("totalWords").textContent = amountInWords(total) + " " + currencyName() + " Only";
}

document.getElementById("resetBtn").addEventListener("click", () => {
    counts = {};
    renderRows();
    updateTotal();
});

// ---------- Settings: denominations ----------
function renderDenomList() {
    const list = document.getElementById("denomList");
    list.innerHTML = "";
    denoms
        .slice()
        .sort((a, b) => b - a)
        .forEach((d) => {
            const chip = document.createElement("div");
            chip.className = "denom-chip";
            chip.innerHTML = `<span>${currencySymbol()}${d}</span><button data-remove="${d}">✕</button>`;
            list.appendChild(chip);
        });
    list.querySelectorAll("button[data-remove]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const val = Number(btn.dataset.remove);
            denoms = denoms.filter((d) => d !== val);
            saveDenoms(denoms);
            renderDenomList();
        });
    });
}

document.getElementById("addDenomBtn").addEventListener("click", () => {
    const input = document.getElementById("newDenomInput");
    const val = parseInt(input.value, 10);
    if (val > 0 && !denoms.includes(val)) {
        denoms.push(val);
        saveDenoms(denoms);
        renderDenomList();
    }
    input.value = "";
});

// ---------- Settings: currency ----------
const currencySelect = document.getElementById("currencySelect");
currencySelect.value = currentCurrency;
currencySelect.addEventListener("change", () => {
    currentCurrency = currencySelect.value;
    saveCurrency(currentCurrency);
    renderDenomList();
    renderRows();
    updateTotal();
});

// ---------- View switching ----------
const calcView = document.getElementById("calcView");
const settingsView = document.getElementById("settingsView");
const settingsBtn = document.getElementById("settingsBtn");
const resetBtn = document.getElementById("resetBtn");

function showSettings() {
    calcView.classList.add("hidden");
    settingsView.classList.remove("hidden");
    settingsBtn.innerHTML = ICONS.home;
    settingsBtn.title = "Home";
    settingsBtn.setAttribute("aria-label", "Home");
    resetBtn.classList.add("hidden");
    renderDenomList();
}

function showCalculator() {
    settingsView.classList.add("hidden");
    calcView.classList.remove("hidden");
    settingsBtn.innerHTML = ICONS.settings;
    settingsBtn.title = "Settings";
    settingsBtn.setAttribute("aria-label", "Settings");
    resetBtn.classList.remove("hidden");
    // denominations may have changed in settings — refresh calculator rows
    renderRows();
    updateTotal();
}

settingsBtn.addEventListener("click", () => {
    const inSettings = !settingsView.classList.contains("hidden");
    if (inSettings) showCalculator();
    else showSettings();
});

// ---------- Theme buttons ----------
document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        saveTheme(theme);
        applyTheme(theme);
    });
});

// ---------- Init ----------
applyTheme(loadTheme());
renderRows();
updateTotal();