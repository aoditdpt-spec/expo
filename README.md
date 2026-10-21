# AOD for Exhibitors

A single static page that the AOD team uses at expos to pitch exhibiting brands and book them on the spot. It has four parts:

- **The pitch:** "Congratulations on your stall 🎉" and the expo reel offer (₹3,500 for 1 reel and a few stall photos, shot on an iPhone 16 Pro Max), with links to sample reels.
- **Why cover your stall at the expo:** six reasons, then the bigger services (photography, video, same-day reels, anchors, promoters, drone).
- **The AOD portfolio:** AOD's own coverage of GATE 2026 and the brands that trust AOD.
- **The booking form:** expo, company name, stall number, point of contact (name, designation, number, email), preferred shoot date, a brief for the artists (optional) and the payment screenshot.

The page works for every expo, current and upcoming. The expos come from one data file, so adding the next one is a copy-and-paste (see below).

No framework and no build step: plain HTML, CSS and JavaScript. It has the same look as aod.co.in: AOD orange, white and black, with Bricolage Grotesque and Montserrat.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page: the pitch sections and the form |
| `config.js` | **Settings:** the Google Sheet address, the offer and price, sample reels, payment details, AOD's phone, WhatsApp and email |
| `data/expos.js` | **The expos.** Add new ones here. |
| `data/portfolio.js` | More portfolio work to show (empty for now) |
| `assets/css/styles.css` | All the styling |
| `assets/js/app.js` | What the page does: expo list, dates, form checks, screenshot upload, sending |
| `assets/img/`, `assets/media/` | The logo, brand logos, service photos and the GATE 2026 footage (copied from the aod.co.in project) |
| `google-apps-script/Code.gs` | The script that saves bookings to a Google Sheet |
| `sheetsguide.md` | **How to connect the Google Sheet**, step by step |

## Before using it with real exhibitors

1. **Connect the Google Sheet.** Follow `sheetsguide.md`. Until `submitUrl` is set in `config.js`, the form opens WhatsApp with the booking and tells the exhibitor to attach the payment screenshot there. Nothing is saved.
2. **Add the payment details.** In `config.js`, under `payment`, fill in `upiId` (and optionally a QR image in `assets/img/` as `qrImage`). Until then the form tells people to ask the AOD team for the QR.
3. **Check the offer.** `offer` in `config.js` holds the price, what's included and the sample reel links. Make sure both Drive links are shared as "Anyone with the link".
4. **Confirm the promises.** The page says the reel is "ready to post while the expo is still on", and the FAQ covers short notice, passes, ownership and drones. Change any of these in `index.html` if they aren't how AOD works.

## Adding an expo

Open `data/expos.js`, copy the FIRSST block, and change it:

```js
{
  id: "gate-2027",                      // short, unique, used in links
  name: "GATE 2027",
  fullName: "GATE 2027 – GCCI Annual Trade Expo",
  sector: "Trade expo",
  days: ["2027-01-08", "2027-01-09", "2027-01-10"],   // every day of the show, YYYY-MM-DD
  hours: "10:00 AM – 7:00 PM",
  venue: "Helipad Exhibition Centre",
  city: "Gandhinagar",
  organiser: "GCCI",
  website: "https://…",
},
```

The page uses it everywhere:

- The **expo list** in the form shows every expo that hasn't ended yet, in date order. Past expos drop out by themselves (Indian time), so they can stay in the file as a record.
- The **"Booking now for …"** line and the **"Congratulations on your stall at …"** line use the next expo.
- The **days** in the form are that expo's days. Today's date is ticked to start with, and days already over can't be picked.
- In the Google Sheet, the expo gets its own tab with its first booking.

## Links for the team

- `…/?expo=firsst-2026` opens the page with that expo already picked.
- `…/?by=Riya` adds "Met by Riya from AOD" under the form, and saves the name with the booking (the Sheet's "Met by" column). Give each team member their own link, or a QR code of it, so you can see who brought in which booking.
- The two can be combined: `…/?expo=firsst-2026&by=Riya`.

After a booking, **"Book another stall"** clears the form but keeps the expo, which helps when going stall to stall.

## Trying it on your computer

Open `index.html` in a browser, or serve the folder so it behaves exactly as it will online:

```bash
cd E:\Projects\Internship\expo
python -m http.server 3200
```

Then open http://localhost:3200. Stop it with Ctrl + C.

## Putting the page online

The folder is a plain static site; any static host works. The simplest is **Vercel**, where aod.co.in already lives:

1. In Vercel: **Add New → Project**. Import this folder from a GitHub repo, or run `npx vercel` inside the folder.
2. Framework preset: **Other**. No build command; the output directory is the folder itself.
3. Optional: give it its own address such as **expo.aod.co.in** (Project → Settings → Domains), plus the DNS record Vercel shows.

After changing `config.js` or `data/expos.js`, deploy again for the change to go live.

## Adding portfolio work

Put real AOD work only. Add photos to `assets/img/portfolio/` and short videos to `assets/media/`, then list them in `data/portfolio.js`. The file has examples. They show as a grid under the GATE 2026 film.

The service photos in `assets/img/services/` are the mock category photos from the aod.co.in project. They illustrate the services and aren't presented as AOD's portfolio. Swap in real AOD photos when you have them.

## How a booking is sent

1. The form checks every field on the phone: a 10-digit Indian mobile, a valid email, at least one shoot date and the screenshot. Typed answers survive a reload.
2. The screenshot is shrunk on the phone (longest side 1600px, JPEG) so it uploads quickly on expo Wi-Fi.
3. **With the Sheet connected:** the booking and the screenshot go to the Google Apps Script. The page says "Booking received" only after the script has saved it.
4. **Without it, or if saving fails:** WhatsApp opens to AOD's number with the whole booking typed out, and the person attaches the screenshot in the chat.
