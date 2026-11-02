/* Lunar Gaming - JavaScript for Parts 2 and 3
   Every feature first checks that its HTML exists, so this one file
   can be loaded on every page. Needs js/data.js to be loaded first. */
"use strict";

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
    highlightCurrentPage();
    setupRevealOnScroll();
    setupCounters();
    setupAccordions();
    setupPackageModal();
    setupLightbox();
    setupOpeningHours();
    setupServiceFinder();
    setupEvents();
    setupShareLinks();
});

/* ---------- Mark the current page in the navigation ---------- */
function highlightCurrentPage() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav a").forEach(function (link) {
        if (link.getAttribute("href") === page) { link.setAttribute("aria-current", "page"); }
    });
}

/* ---------- Fade sections in as they scroll into view ---------- */
function setupRevealOnScroll() {
    const sections = document.querySelectorAll("main > section");
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    sections.forEach(function (section) {
        section.classList.add("reveal");
        observer.observe(section);
    });
}

/* ---------- Count-up animation for the statistics (50+, 10K+ ...) ---------- */
function setupCounters() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numbers = [];

    document.querySelectorAll(".mission-card h2").forEach(function (heading) {
        const match = heading.textContent.trim().match(/^(\d+)(K?\+?)$/);   // "50+", "10K+", "25+"
        if (match) { numbers.push({ el: heading, target: Number(match[1]), suffix: match[2] }); }
    });
    if (!numbers.length || reduce || !("IntersectionObserver" in window)) { return; }

    function run(item) {
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / 1300, 1);
            item.el.textContent = Math.round(item.target * progress) + item.suffix;
            if (progress < 1) { requestAnimationFrame(frame); }
        }
        requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) { return; }
            const item = numbers.find(function (n) { return n.el === entry.target; });
            run(item);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    numbers.forEach(function (item) { observer.observe(item.el); });
}

/* ---------- Accordions: services details (Part 2) and contact FAQ ---------- */
/* Fixed: the old file attached the click handler twice, so every click opened
   and instantly closed the panel again. Now each button gets exactly one handler. */
function setupAccordions() {
    document.querySelectorAll(".accordion-button").forEach(function (button) {
        const panel = document.getElementById(button.getAttribute("aria-controls")) ||
                      button.nextElementSibling;
        if (!panel) { return; }
        const showText = button.dataset.showText;
        const hideText = button.dataset.hideText;

        button.addEventListener("click", function () {
            const willOpen = button.getAttribute("aria-expanded") !== "true";
            button.setAttribute("aria-expanded", String(willOpen));
            panel.hidden = !willOpen;
            if (showText && hideText) { button.textContent = willOpen ? hideText : showText; }
        });
    });
}

/* ---------- Package details modal (native <dialog>) ---------- */
function setupPackageModal() {
    const dialog = document.querySelector("#package-dialog");
    if (!dialog || typeof dialog.showModal !== "function") { return; }

    const title = dialog.querySelector("[data-modal-title]");
    const body = dialog.querySelector("[data-modal-body]");
    const link = dialog.querySelector("[data-modal-link]");

    document.querySelectorAll("[data-package]").forEach(function (button) {
        button.addEventListener("click", function () {
            const card = button.closest(".mission-card");
            title.textContent = card.querySelector("h3").textContent.trim() + " package";
            body.replaceChildren(card.querySelector("ul").cloneNode(true));
            const price = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = card.querySelector("[data-price]").textContent.trim();
            price.appendChild(strong);
            body.appendChild(price);
            link.href = "enquiry.html?service=" + encodeURIComponent(button.dataset.package);
            dialog.showModal();
        });
    });

    dialog.querySelectorAll("[data-close]").forEach(function (b) {
        b.addEventListener("click", function () { dialog.close(); });
    });
    dialog.addEventListener("click", function (event) {      // click on the dark backdrop
        if (event.target === dialog) { dialog.close(); }
    });
}

/* ---------- Image lightbox with previous / next (about page gallery) ---------- */
function setupLightbox() {
    const dialog = document.querySelector("#image-lightbox");
    const enlarged = document.querySelector("#lightbox-image");
    const closeButton = document.querySelector("#close-lightbox");
    const caption = document.querySelector("#lightbox-caption");
    const items = Array.from(document.querySelectorAll(".gallery-item"));
    if (!dialog || !enlarged || !closeButton || !items.length ||
        typeof dialog.showModal !== "function") { return; }

    let index = 0;

    function show(i) {
        index = (i + items.length) % items.length;
        const picture = items[index].querySelector(".lightbox-image");
        enlarged.src = picture.src;
        enlarged.alt = picture.alt;
        caption.textContent = picture.alt + " (" + (index + 1) + " of " + items.length + ")";
    }

    items.forEach(function (item, i) {
        item.addEventListener("click", function () { show(i); dialog.showModal(); });
    });
    document.querySelector("#lightbox-prev").addEventListener("click", function () { show(index - 1); });
    document.querySelector("#lightbox-next").addEventListener("click", function () { show(index + 1); });
    closeButton.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) { dialog.close(); } });
    dialog.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") { show(index + 1); }
        if (event.key === "ArrowLeft") { show(index - 1); }
    });
    dialog.addEventListener("close", function () { enlarged.removeAttribute("src"); });
}

/* ---------- Business hours: show whether we are open right now ---------- */
function setupOpeningHours() {
    const statusCells = document.querySelectorAll("[data-status-day]");
    if (!statusCells.length) { return; }

    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;

    statusCells.forEach(function (cell) {
        const day = Number(cell.dataset.statusDay);
        if (day !== now.getDay()) { return; }
        const hours = window.LUNAR.hours[day];
        const open = hour >= hours[0] && hour < hours[1];
        cell.textContent = open ? "Open now" : "Closed now";
        cell.classList.add("today");
        document.querySelectorAll('[data-day="' + day + '"]').forEach(function (p) { p.classList.add("today"); });
    });
}

/* ---------- Service Finder: live search + category filter + sort ---------- */
function setupServiceFinder() {
    const list = document.querySelector("#service-list");
    const search = document.querySelector("#service-search");
    const category = document.querySelector("#service-category");
    const sort = document.querySelector("#service-sort");
    const message = document.querySelector("#service-message");
    if (!list || !search || !category || !sort || !message) { return; }

    const services = window.LUNAR.services;

    function makeCard(service) {
        const card = document.createElement("div");
        card.className = "mission-card";

        const heading = document.createElement("h3");
        heading.textContent = service.name;
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = service.category;
        const text = document.createElement("p");
        text.textContent = service.desc;
        const price = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = service.priceText;
        price.appendChild(strong);
        const link = document.createElement("a");
        link.href = "enquiry.html?service=" + encodeURIComponent(service.key);
        link.textContent = "Enquire about this service";

        card.append(heading, badge, text, price, link);
        return card;
    }

    function update() {
        const words = search.value.toLowerCase().trim();

        const matches = services.filter(function (s) {
            const textMatch = (s.name + " " + s.desc + " " + s.category).toLowerCase().includes(words);
            return textMatch && (category.value === "all" || s.category === category.value);
        });

        matches.sort(function (a, b) {
            switch (sort.value) {
                case "price-low":  return a.price - b.price || a.name.localeCompare(b.name);
                case "price-high": return b.price - a.price || a.name.localeCompare(b.name);
                case "name-desc":  return b.name.localeCompare(a.name);
                default:           return a.name.localeCompare(b.name);
            }
        });

        list.replaceChildren.apply(list, matches.map(makeCard));
        message.textContent = matches.length === 0
            ? "No services match your search. Try another word or choose All categories."
            : matches.length + (matches.length === 1 ? " service found." : " services found.");
    }

    search.addEventListener("input", update);
    category.addEventListener("change", update);
    sort.addEventListener("change", update);
    update();
}

/* ---------- Events and news: built with JavaScript, 3 at a time ---------- */
function setupEvents() {
    const list = document.querySelector("#event-list");
    const button = document.querySelector("#load-more");
    const filter = document.querySelector("#event-filter");
    const message = document.querySelector("#event-message");
    if (!list || !button || !filter || !message) { return; }

    const PAGE_SIZE = 3;
    const now = new Date();
    const today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" +
                  String(now.getDate()).padStart(2, "0");
    let shown = 0;

    function upcoming() {
        return window.LUNAR.events
            .filter(function (e) { return e.date >= today && (filter.value === "all" || e.category === filter.value); })
            .sort(function (a, b) { return a.date.localeCompare(b.date); });
    }

    function makeCard(event) {
        const card = document.createElement("article");
        card.className = "mission-card";

        const when = document.createElement("time");
        when.dateTime = event.date;
        when.textContent = new Date(event.date + "T12:00:00").toLocaleDateString("en-ZA",
            { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = event.category;
        const heading = document.createElement("h3");
        heading.textContent = event.title;               // textContent keeps any HTML harmless
        const summary = document.createElement("p");
        summary.textContent = event.summary;
        const link = document.createElement("a");
        link.href = "enquiry.html";
        link.textContent = "Enquire about this event";

        card.append(when, badge, heading, summary, link);
        return card;
    }

    function render(reset) {
        const events = upcoming();
        if (reset) { list.replaceChildren(); shown = 0; }
        events.slice(shown, shown + PAGE_SIZE).forEach(function (e) { list.appendChild(makeCard(e)); });
        shown = Math.min(shown + PAGE_SIZE, events.length);

        button.hidden = shown >= events.length;
        message.textContent = events.length === 0
            ? "No upcoming events in this category right now. Please check back soon."
            : "Showing " + shown + " of " + events.length + " upcoming items.";
    }

    button.addEventListener("click", function () { render(false); });
    filter.addEventListener("change", function () { render(true); });
    render(true);
}

/* ---------- Share buttons (off-page SEO: makes the site easy to promote) ---------- */
function setupShareLinks() {
    const box = document.querySelector("[data-share]");
    if (!box) { return; }
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    const links = {
        facebook: "https://www.facebook.com/sharer/sharer.php?u=" + url,
        x: "https://twitter.com/intent/tweet?url=" + url + "&text=" + text,
        whatsapp: "https://wa.me/?text=" + text + "%20" + url
    };
    box.querySelectorAll("a[data-network]").forEach(function (a) { a.href = links[a.dataset.network]; });
}
