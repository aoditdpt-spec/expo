// Expos AOD is pitching at. To add one, copy a block, change the details and save: the form's
// "Which expo?" list, the "Now booking" line in the hero and the day picker all come from here.
//
// - id:     short and unique, used in links (…/?expo=firsst-2026 opens the form with it picked)
// - days:   every day of the show, as "YYYY-MM-DD" in order (the form offers each one)
// - The list only shows expos whose last day hasn't passed yet (Indian time); past ones can stay
//   here as a record. Leave out any field you don't know.
window.AOD_EXPOS = [
  {
    id: "firsst-2026",
    name: "FIRSST 2026",
    fullName: "FIRSST 2026 – Fire Safety & Security Trade Show",
    edition: "2nd edition",
    sector: "Fire safety & security",
    days: ["2026-10-22", "2026-10-23", "2026-10-24"],
    hours: "10:00 AM – 6:00 PM",
    venue: "Helipad Exhibition Centre",
    city: "Gandhinagar",
    organiser: "Brahmani Events",
    website: "https://firsst.in/",
  },
  {
    id: "iif-2026",
    name: "IIF 2026",
    fullName: "IIF 2026 – Indian Industrial Fair (Udyam 2026)",
    sector: "Industrial fair for MSMEs",
    days: ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"],
    venue: "Helipad Ground",
    city: "Gandhinagar",
    organiser: "Laghu Udyog Bharati",
    website: "https://lubindiaexpo.com/",
  },
];
