# AOD for Exhibitors

A single static page that the AOD team uses at expos to pitch exhibiting brands and book them on the spot. It's kept short on purpose:

- **The pitch** (no background video; on laptops three columns of the same height: the text, a 9:16 reel in the middle (`heroVideo` in `config.js`: now the GTZ stall reel, `assets/media/gtz-reel.mp4`, with GTZ's watermark cropped out; muted, with a sound button; a tap pauses or plays it; on laptops and desktops it shrinks into a small player in the bottom-left corner after scrolling past the hero, with a ✕ to close it; an empty "VIDEO HERE" box when `src` is empty), and the offer card): "Congratulations on your stall 🎉", the headline "You built a premium stall. Turn it into a reel that gets seen, shared, and remembered." and the expo reel offer (~~₹5,000~~ ₹3,499 for 1 reel and stall photos, shot on high quality camera by a professional reel creator), with links to sample reels.
- **Brands that trust AOD:** a scrolling strip of logos.
- **The AOD portfolio:** AOD's own coverage of GATE 2026.
- **The booking form** (straight after the logos, before the portfolio): expo, company name, stall number, point of contact (name, designation, number, email), preferred shoot date, a brief for the artists (optional) and the payment screenshot.
- **A last "book now" band.**

The page works for every expo, current and upcoming. The expos come from one data file, so adding the next one is a copy-and-paste (see below).

No framework and no build step: plain HTML, CSS and JavaScript. `npm run dev` only serves the folder; there is nothing to install or build. It has the same look as aod.co.in: AOD orange, white and black, with Bricolage Grotesque and Montserrat.

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
| `domain-guide.md` | **How to put the page on expos.aod.co.in** (Vercel + GoDaddy), step by step |
| `package.json`, `scripts/serve.mjs` | `npm run dev`: serves the folder at http://localhost:3001 |

## Before using it with real exhibitors

1. **Google Sheet: connected** (22 Oct 2026). The Sheet and the script are on aod.itdpt@gmail.com (the account of the aod.co.in orders sheet), `submitUrl` in `config.js` points to the web app, and each booking adds a row, saves the screenshot and logo to Drive and emails communication.aod@gmail.com. `sheetsguide.md` is how it was set up. If `submitUrl` is ever emptied, the form goes back to opening WhatsApp with the booking and saving nothing.
2. **Payment details.** `payment` in `config.js` has the UPI ID (`thakkardhruvi5701@oksbi`, the account of Dhruvi Thakkar) and the QR (`assets/img/upi-qr.png`, cut from the Google Pay QR). Each booking is for one shoot day (the form takes one date), so the amount to pay is the offer's price, ₹3,499. On phones, tapping the QR, the UPI ID or "Pay ₹… in your UPI app" opens the UPI app with that amount filled in; iPhones also get Google Pay, PhonePe and Paytm buttons. On laptops the QR is scanned with a phone and the amount is shown big to type in. Some UPI apps refuse a payment link to a personal UPI ID: BHIM says "request type not supported" (Google Pay accepts it), so under the Pay button the page tells people to copy the UPI ID and pay the amount by hand. Scanning the QR from another phone also works, and a business (merchant) UPI ID avoids the problem in every app. To change the account, change `upiId` and `payeeName` and replace the QR image.
3. **Check the offer.** `offer` in `config.js` holds the price, what's included and the sample reel links. Make sure both Drive links are shared as "Anyone with the link".
4. **Expos on the page:** FIRSST 2026 (22–24 Oct, Helipad Exhibition Centre) and IIF 2026, the Indian Industrial Fair by Laghu Udyog Bharati (23–26 Oct, Helipad Ground), both in Gandhinagar. Add the next one in `data/expos.js`.

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

- The **expo list** in the form shows the expos that are on or coming up, in date order, then the ones that ended in the last 30 days, marked "ended". After 30 days an expo drops out by itself (Indian time), so it can stay in the file as a record. The hero's "Booking now" line only names expos that are on or coming up.
- The **"Booking now for …"** line and the **"Congratulations on your stall at …"** line use the next expo.
- The **days** in the form are that expo's days, and one can be picked (one booking, one shoot day). Today's date is picked to start with, and days that have passed can still be picked, so a shoot can be booked or recorded afterwards.
- In the Google Sheet, the expo gets its own tab with its first booking.

## Links for the team

- `…/?expo=firsst-2026` opens the page with the hero naming that expo ("Congratulations on your stall at FIRSST 2026"). The form never picks an expo by itself; the exhibitor chooses it.
- `…/?by=Riya` adds "Met by Riya from AOD" under the form, and saves the name with the booking (the Sheet's "Met by" column). Give each team member their own link, or a QR code of it, so you can see who brought in which booking.
- The two can be combined: `…/?expo=firsst-2026&by=Riya`.

After a booking, **"Book another stall"** clears the form but keeps the expo, which helps when going stall to stall.

## Trying it on your computer

```bash
cd E:\Projects\Internship\expo
npm run dev
```

Then open http://localhost:3001. Nothing to install: `scripts/serve.mjs` is a tiny server with no dependencies. It runs on port 3001 so it never clashes with the aod.co.in project on 3000. It also prints an "On your phone" address, which opens the page on a phone on the same Wi-Fi. Stop it with Ctrl + C.

(Opening `index.html` straight from the folder also works, but the server is closer to how it runs online.)

## The live page and its QR code

The page is live at **https://expos.aod.co.in/** (Vercel, from this repo; the first address, https://expo-two-ochre.vercel.app/, still opens it). `qr/expo-page-qr.png` (1600×1600, for printing) and `qr/expo-page-qr.svg` (sharp at any size, for standees and banners) are QR codes of that address (the per-expo ones, `qr/firsst-2026-qr.*` and `qr/iif-2026-qr.*`, add `?expo=<id>`), with high error correction so they still scan when printed small or partly covered. If the address changes again, make new ones:

```bash
npx -y qrcode@1.5.4 -e H -w 1600 -m 4 -o qr/expo-page-qr.png "https://NEW-ADDRESS/"
npx -y qrcode@1.5.4 -e H -m 4 -t svg -o qr/expo-page-qr.svg "https://NEW-ADDRESS/"
```

Each expo also has its own QR, which opens the page with the hero naming that expo: `qr/firsst-2026-qr.png` / `.svg` (`?expo=firsst-2026`) and `qr/iif-2026-qr.png` / `.svg` (`?expo=iif-2026`). For a new expo, run the same commands with `?expo=<its id>`.

A team member's own QR (bookings show "Met by" with their name) is the same command with `?by=Name` on the address, e.g. `https://expo-two-ochre.vercel.app/?by=Riya`.

## Putting the page online

The folder is a plain static site; any static host works. The simplest is **Vercel**, where aod.co.in already lives:

1. In Vercel: **Add New → Project**. Import this folder from a GitHub repo, or run `npx vercel` inside the folder.
2. Framework preset: **Other**. No build command; the output directory is the folder itself.
3. Optional: give it its own address such as **expo.aod.co.in** (Project → Settings → Domains), plus the DNS record Vercel shows.

After changing `config.js` or `data/expos.js`, deploy again for the change to go live.

## Adding portfolio work

Put real AOD work only. Add photos to `assets/img/portfolio/` and short videos to `assets/media/`, then list them in `data/portfolio.js`. The file has examples. They show as a grid under the GATE 2026 film.

(`assets/img/services/` still holds mock category photos from the aod.co.in project. The page no longer uses them; don't show them as AOD's work.)

## How a booking is sent

1. The form checks every field on the phone: a 10-digit Indian mobile, a valid email, at least one shoot date and the screenshot. Typed answers survive a reload.
2. The payment screenshot is shrunk on the phone (longest side 1600px, JPEG) so they upload quickly on expo Wi-Fi.
3. **With the Sheet connected:** the booking and the screenshot go to the Google Apps Script. The page says "Booking received" only after the script has saved it.
4. **Without it, or if saving fails:** WhatsApp opens to AOD's number with the whole booking typed out, and the person attaches the screenshot in the chat.
