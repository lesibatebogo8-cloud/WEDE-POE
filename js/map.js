/* Lunar Gaming - interactive map (Leaflet + OpenStreetMap tiles).
   Leaflet is loaded from a CDN in contact.html. If it cannot load
   (offline, blocked) a text fallback with a normal link is shown instead. */
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const mapBox = document.querySelector("#map");
    if (!mapBox) { return; }

    if (typeof L === "undefined") {
        mapBox.classList.add("map-fallback");
        mapBox.textContent = "The interactive map could not load. Use the link below to open our location in Google Maps.";
        return;
    }

    const place = [-23.910963, 29.447713];                 // Polokwane
    const map = L.map(mapBox, { scrollWheelZoom: false }).setView(place, 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    }).addTo(map);

    L.circleMarker(place, { radius: 11, color: "#141414", weight: 3, fillColor: "#2de714", fillOpacity: 1 })
        .addTo(map)
        .bindPopup("<strong>Lunar Gaming</strong><br>Polokwane, Limpopo<br>Open daily")
        .openPopup();

    // Wheel zoom only after the visitor clicks the map (stops accidental page-scroll trapping).
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
});