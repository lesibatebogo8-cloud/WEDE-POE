"use strict";

const CONTACT_EMAIL = "info@lunargaming.com";      // recipient of the contact form email

/* ---------- Validation rules (each returns an error message, or "" when valid) ---------- */
const rules = {
    name: function (v) {
        if (v.length < 2 || v.length > 60) { return "Please enter your full name (2 to 60 characters)."; }
        if (!/^[\p{L}][\p{L} '.\-]*$/u.test(v)) { return "Names can only contain letters, spaces, apostrophes, dots and hyphens."; }
        return "";
    },
    email: function (v) {
        if (!v) { return "Please enter your email address."; }
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Please enter a valid email, for example name@example.com.";
    },
    phoneRequired: function (v) { return v ? rules.phone(v) : "Please enter your phone number."; },
    phone: function (v) {
        if (!v) { return ""; }
        const digits = v.replace(/[\s\-()]/g, "");
        // South African numbers: 0 + 9 digits, or +27 + 9 digits
        return /^(?:\+27|0)[1-9]\d{8}$/.test(digits) ? "" : "Use a South African number such as 068 404 7374 or +27 68 404 7374.";
    },
    required: function (v) { return v ? "" : "Please choose an option."; },
    subject: function (v) {
        return v.length >= 3 && v.length <= 100 ? "" : "The subject must be between 3 and 100 characters.";
    },
    message: function (v) {
        if (v.length < 10) { return "Your message must be at least 10 characters (you have " + v.length + ")."; }
        return v.length <= 1000 ? "" : "Your message must be 1000 characters or fewer.";
    },
    quantity: function (v, form) {
        const max = Number(form.elements.quantity.max) || 50;
        const n = Number(v);
        if (!v || !Number.isInteger(n) || n < 1 || n > max) { return "Enter a whole number from 1 to " + max + "."; }
        return "";
    },
    date: function (v) {
        if (!v) { return "Please choose a preferred date."; }
        const chosen = new Date(v + "T00:00:00");
        if (Number.isNaN(chosen.getTime())) { return "Please enter a valid date."; }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const limit = new Date(today); limit.setFullYear(limit.getFullYear() + 1);
        if (chosen < today) { return "The date cannot be in the past."; }
        if (chosen > limit) { return "Please choose a date within the next 12 months."; }
        return "";
    }
};

/* ---------- Generic form helper ---------- */
function setupForm(form, fieldRules, onValid) {
    form.noValidate = true;                     // JS shows friendly messages instead of browser bubbles
    const summary = form.querySelector(".form-summary");

    function fieldOf(name) { return form.elements[name].closest(".field"); }

    function check(name) {
        const input = form.elements[name];
        const error = fieldRules[name](input.value.trim(), form);
        const field = fieldOf(name);
        const output = field.querySelector(".error-msg");
        field.classList.toggle("invalid", error !== "");
        field.classList.toggle("valid", error === "" && input.value.trim() !== "");
        input.setAttribute("aria-invalid", String(error !== ""));
        output.textContent = error;
        return error === "";
    }

    Object.keys(fieldRules).forEach(function (name) {
        const input = form.elements[name];
        input.addEventListener("blur", function () { check(name); });
        input.addEventListener("input", function () { if (fieldOf(name).classList.contains("invalid")) { check(name); } });
        input.addEventListener("change", function () { check(name); });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.elements.website && form.elements.website.value) { return; }   // honeypot: bots fill this in

        const failed = Object.keys(fieldRules).filter(function (name) { return !check(name); });
        if (failed.length) {
            summary.textContent = "Please fix " + failed.length + (failed.length === 1 ? " field" : " fields") + " below and try again.";
            form.elements[failed[0]].focus();
            return;
        }
        summary.textContent = "";
        onValid();
    });

    form.addEventListener("reset", function () {
        summary.textContent = "";
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid", "valid"); });
        form.querySelectorAll(".error-msg").forEach(function (e) { e.textContent = ""; });
        document.querySelectorAll(".result-box").forEach(function (b) { b.hidden = true; });
        const counter = form.querySelector(".counter");
        if (counter) { counter.textContent = "0 / 1000 characters"; }
    });

    return check;
}

function setupCounter(form) {
    const counter = form.querySelector(".counter");
    const message = form.elements.message;
    if (!counter) { return; }
    message.addEventListener("input", function () { counter.textContent = message.value.length + " / 1000 characters"; });
}

function addRow(list, term, description) {          // builds <dt>/<dd> pairs with textContent (safe)
    const dt = document.createElement("dt"); dt.textContent = term;
    const dd = document.createElement("dd"); dd.textContent = description;
    list.append(dt, dd);
}

function formatRand(amount) {
    return amount === 0 ? "FREE" : "R" + amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

document.addEventListener("DOMContentLoaded", function () {
    const enquiry = document.querySelector("#enquiry-form");
    const contact = document.querySelector("#contact-form");
    if (enquiry) { setupEnquiry(enquiry); }
    if (contact) { setupContact(contact); }
});

/* ======================================================
   ENQUIRY FORM: validate -> calculate cost + availability -> send with AJAX
   ====================================================== */
function setupEnquiry(form) {
    const select = form.elements.service;
    const quantityLabel = document.querySelector("#quantity-label");
    const dateInput = form.elements.date;
    const result = document.querySelector("#enquiry-result");
    const pricing = window.LUNAR.pricing;

    // Earliest date = today (local time)
    const t = new Date();
    dateInput.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");

    // The quantity label and limit change with the chosen option (DOM manipulation)
    function updateQuantity() {
        const info = pricing[select.value];
        if (!info) { return; }
        quantityLabel.textContent = "Number of " + info.unit + ":";
        form.elements.quantity.max = info.unit === "months" ? 12 : 50;
    }
    select.addEventListener("change", updateQuantity);

    // Allow links such as enquiry.html?service=coaching to pre-select the option
    const wanted = new URLSearchParams(window.location.search).get("service");
    if (wanted && pricing[wanted]) { select.value = wanted; }
    updateQuantity();
    setupCounter(form);

    const check = setupForm(form, {
        name: rules.name, email: rules.email, phone: rules.phoneRequired,
        service: rules.required, quantity: rules.quantity, date: rules.date, message: rules.message
    }, function () { process(); });

    function buildResponse(data) {
        const info = pricing[data.service];
        const qty = Number(data.quantity);
        const total = info.price * qty;
        const day = new Date(data.date + "T12:00:00");
        const [open, close] = window.LUNAR.hours[day.getDay()];
        const reference = "LG-" + data.date.replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

        const lines = [];
        lines.push(["Reference", reference]);
        lines.push(["Enquiry about", info.label]);
        lines.push(["Cost", info.price === 0 ? "FREE - no charge for this option."
            : formatRand(info.price) + " " + info.per + " x " + qty + " = " + formatRand(total) + " in total."]);

        let availability;
        if (data.service === "tournament") {
            const next = window.LUNAR.events
                .filter(function (e) { return e.category === "Tournament" && e.date >= data.date; })
                .sort(function (a, b) { return a.date.localeCompare(b.date); })[0];
            availability = next
                ? "The next tournament on or after your date is " + next.title + " on " + formatDate(next.date) + ". Spaces are limited, so register early."
                : "No tournament is scheduled after your chosen date yet. We will email you when the next one is announced.";
        } else if (["coaching", "setup", "pro", "elite"].indexOf(data.service) !== -1) {
            availability = "Our team is available on " + formatDate(data.date) + " between " +
                String(open).padStart(2, "0") + ":00 and " + String(close).padStart(2, "0") + ":00. We will confirm an exact time slot by email.";
        } else {
            availability = "Available immediately. You can start on " + formatDate(data.date) + " or sooner.";
        }
        lines.push(["Availability", availability]);
        lines.push(["Next step", "A confirmation will be sent to " + data.email + " within one business day."]);
        return lines;
    }

    function showResult(title, lines, isError) {
        result.hidden = false;
        result.classList.toggle("error", Boolean(isError));
        result.replaceChildren();
        const heading = document.createElement("h3"); heading.textContent = title;
        const list = document.createElement("dl");
        lines.forEach(function (row) { addRow(list, row[0], row[1]); });
        result.append(heading, list);
        const status = document.createElement("p");
        status.id = "send-status"; status.className = "status-msg";
        result.appendChild(status);
        result.focus();
        return status;
    }

    function process() {
        const data = {
            service: select.value, quantity: form.elements.quantity.value, date: dateInput.value,
            email: form.elements.email.value.trim()
        };
        const status = showResult("Thank you, " + form.elements.name.value.trim().split(" ")[0] + "! Here is your response", buildResponse(data));
        sendWithAjax(form, status);
    }
}

/* AJAX: send the data in the background (fetch) without reloading the page.
   The form's action attribute holds the endpoint. While it still contains
   "your-form-id" we run in demo mode and skip the network request. */
function sendWithAjax(form, status) {
    const url = form.getAttribute("action");
    const button = form.querySelector('input[type="submit"]');

    if (!url || url.indexOf("your-form-id") !== -1) {
        status.textContent = "Demo mode: the form passed validation (set a real endpoint in the form's action attribute to receive submissions).";
        return;
    }
    button.disabled = true;
    status.textContent = "Sending your enquiry...";

    fetch(url, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (response) {
            if (!response.ok) { throw new Error("Server replied with status " + response.status); }
            status.textContent = "Your enquiry was sent successfully.";
            form.reset();
        })
        .catch(function () {
            status.textContent = "We could not send your enquiry right now. Please try again or email " + CONTACT_EMAIL + ".";
        })
        .finally(function () { button.disabled = false; });
}

/* ======================================================
   CONTACT FORM: validate -> compile an email -> let the visitor send it
   ====================================================== */
function setupContact(form) {
    const result = document.querySelector("#contact-result");
    setupCounter(form);

    setupForm(form, {
        fullname: rules.name, email: rules.email, phone: rules.phone, subject: rules.subject,
        category: rules.required, message: rules.message
    }, function () { compose(); });

    function compose() {
        const type = form.elements.category.options[form.elements.category.selectedIndex].text.trim();
        const subject = "[" + type + "] " + form.elements.subject.value.trim();
        const body = [
            "Hello Lunar Gaming team,", "",
            form.elements.message.value.trim(), "",
            "--- Contact details ---",
            "Name: " + form.elements.fullname.value.trim(),
            "Email: " + form.elements.email.value.trim(),
            "Phone: " + (form.elements.phone.value.trim() || "not provided"),
            "Message type: " + type
        ].join("\n");

        const mailto = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

        result.hidden = false;
        result.replaceChildren();
        const heading = document.createElement("h3"); heading.textContent = "Your email is ready";
        const intro = document.createElement("p");
        intro.textContent = "Check the message below, then press the button to open it in your email app. It will be addressed to " + CONTACT_EMAIL + ".";
        const preview = document.createElement("pre");
        preview.className = "email-preview";
        preview.textContent = "To: " + CONTACT_EMAIL + "\nSubject: " + subject + "\n\n" + body;
        const send = document.createElement("a");
        send.className = "btn";
        send.href = mailto;
        send.textContent = "SEND EMAIL";
        result.append(heading, intro, preview, send);
        result.focus();
    }
}