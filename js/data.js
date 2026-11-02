/* Lunar Gaming - shared data used by the dynamic content and the enquiry form.
   Keeping it in one place means events, prices and opening hours are edited once. */
"use strict";

window.LUNAR = {
    // Opening hours (0 = Sunday ... 6 = Saturday) as [open, close] in 24h hours.
    hours: {
        0: [9, 16], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 20], 6: [9, 20]
    },

    // Services shown in the Service Finder (services.html). "key" links to pricing below.
    services: [
        { key: "discovery",  name: "Game Discovery",    category: "Discover",  price: 0,   priceText: "FREE",
          desc: "Discover new and popular games across different genres and platforms." },
        { key: "tournament", name: "Gaming Tournaments", category: "Compete",   price: 50,  priceText: "R50+",
          desc: "Participate in competitive gaming tournaments and challenges." },
        { key: "coaching",   name: "Gaming Coaching",   category: "Learn",     price: 100, priceText: "R100+",
          desc: "Improve your gaming skills with guidance and training." },
        { key: "setup",      name: "Gaming Setup",      category: "Learn",     price: 150, priceText: "R150+",
          desc: "Assistance with creating and improving a gaming setup." },
        { key: "community",  name: "Gaming Community",  category: "Community", price: 0,   priceText: "FREE",
          desc: "Join other gamers and become part of the Lunar Gaming community." },
        { key: "news",       name: "Gaming News",       category: "Community", price: 0,   priceText: "FREE",
          desc: "Stay updated with gaming news, releases and upcoming events." }
    ],

    // Events / news posts. Dates are ISO strings (YYYY-MM-DD).
    events: [
        { id: 1, title: "Lunar Cup: EA Sports FC Showdown", date: "2026-11-14", category: "Tournament",
          summary: "1v1 knockout bracket for all skill levels. Entry is R50 per player and prizes go to the top three." },
        { id: 2, title: "Beginner Coaching Clinic", date: "2026-11-21", category: "Workshop",
          summary: "A free group session on aiming, map awareness and teamwork led by Lunar Gaming coaches." },
        { id: 3, title: "Build-on-a-Budget Setup Day", date: "2026-11-28", category: "Workshop",
          summary: "Bring your questions and your budget. We help you choose a monitor, controller and headset." },
        { id: 4, title: "Community Game Night", date: "2026-12-05", category: "Community",
          summary: "Casual multiplayer evening. Meet other gamers, make teams and try new games together." },
        { id: 5, title: "Lunar Cup: Minecraft Build Battle", date: "2026-12-12", category: "Tournament",
          summary: "Teams of two get one hour and one theme. The community votes for the winning build." },
        { id: 6, title: "Holiday Gaming Marathon", date: "2026-12-19", category: "Community",
          summary: "A relaxed all-day gaming session with snacks, giveaways and mini challenges." },
        { id: 7, title: "New Year Call of Duty Cup", date: "2027-01-16", category: "Tournament",
          summary: "Squad-based tournament to start the year. Register early because spaces are limited." },
        { id: 8, title: "Season Kick-off and Gaming News", date: "2027-01-30", category: "News",
          summary: "A look at the games and events planned for the new season, plus your questions answered." }
    ],

    // Prices used by the enquiry calculator (South African rand).
    // unit = what the quantity field means for that option.
    pricing: {
        discovery:  { label: "Game Discovery",         price: 0,   unit: "players",  per: "free" },
        tournament: { label: "Gaming Tournament Entry", price: 50,  unit: "players",  per: "per player" },
        coaching:   { label: "Gaming Coaching",         price: 100, unit: "sessions", per: "per session" },
        setup:      { label: "Gaming Setup Help",       price: 150, unit: "sessions", per: "per consultation" },
        community:  { label: "Gaming Community",        price: 0,   unit: "members",  per: "free" },
        news:       { label: "Gaming News",             price: 0,   unit: "members",  per: "free" },
        gamer:      { label: "Gamer Package",           price: 0,   unit: "months",   per: "free" },
        pro:        { label: "Pro Gamer Package",       price: 199, unit: "months",   per: "per month" },
        elite:      { label: "Elite Gamer Package",     price: 399, unit: "months",   per: "per month" },
        other:      { label: "General question",        price: 0,   unit: "items",    per: "no charge" }
    }
};
