# AOD for Exhibitors

A single static page that the AOD team uses at expos to pitch exhibiting brands and book them on the spot. It's kept short on purpose:

- **The pitch** (no background video; on laptops three columns of the same height: the text, a 9:16 reel in the middle (`heroVideo` in `config.js`: now the GTZ stall reel, `assets/media/gtz-reel.mp4`, with GTZ's watermark cropped out; muted, with a sound button; a tap pauses or plays it; on laptops and desktops it shrinks into a small player in the bottom-right corner after scrolling past the hero, with a ✕ to close it; an empty "VIDEO HERE" box when `src` is empty), and the offer card): "Congratulations on your stall 🎉", the headline "You built a premium stall. Turn it into a reel that gets seen, shared, and remembered." and the expo reel offer (~~₹5,000~~ ₹3,499 for 1 reel and stall photos, shot on high quality camera by a professional reel creator), with links to sample reels.
- **Brands that trust AOD:** a scrolling strip of logos.
- **The AOD portfolio:** AOD's own coverage of GATE 2026.
- **The booking form** (straight after the logos, before the portfolio): expo, company name, company logo (optional), stall number, point of contact (name, designation, number, email), preferred shoot date, a brief for the artists (optional) and the payment screenshot.
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
| `package.json`, `scripts/serve.mjs` | `npm run dev`: serves the folder at http://localhost:3001 |

## Before using it with real exhibitors

1. **Connect the Google Sheet.** Follow `sheetsguide.md`, signed in as aod.itdpt@gmail.com (the account of the aod.co.in orders sheet). Until `submitUrl` is set in `config.js`, the form opens WhatsApp with the booking and tells the exhibitor to attach the payment screenshot there. Nothing is saved.
2. **Payment details.** `payment` in `config.js` has the UPI ID (`thakkardhruvi5701@oksbi`, the account of Dhruvi Thakkar) and the QR (`assets/img/upi-qr.png`, cut from the Google Pay QR). The amount to pay is the offer's price for each shoot day picked (1 day ₹3,499, 2 days ₹6,998, 3 days ₹10,497) and updates as days are ticked. On phones, tapping the QR, the UPI ID or "Pay ₹… in your UPI app" opens the UPI app with that amount filled in; iPhones also get Google Pay, PhonePe and Paytm buttons. On laptops the QR is scanned with a phone and the amount is shown big to type in. Some UPI apps (Google Pay especially) can refuse a payment link to a personal UPI ID; scanning the QR still works, and a business (merchant) UPI ID avoids it. To change the account, change `upiId` and `payeeName` and replace the QR image.
3. **Check the offer.** `offer` in `config.js` holds the price, what's included and the sample reel links. Make sure both Drive links are shared as "Anyone with the link".
4. **Confirm the promises.** The page says the reel is "ready to post while the expo is still on", Change it in `index.html` if that isn't how AOD works.

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

```bash
cd E:\Projects\Internship\expo
npm run dev
```

Then open http://localhost:3001. Nothing to install: `scripts/serve.mjs` is a tiny server with no dependencies. It runs on port 3001 so it never clashes with the aod.co.in project on 3000. It also prints an "On your phone" address, which opens the page on a phone on the same Wi-Fi. Stop it with Ctrl + C.

(Opening `index.html` straight from the folder also works, but the server is closer to how it runs online.)

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
2. The payment screenshot (longest side 1600px, JPEG) and the logo (1000px, PNG, so a transparent background stays transparent) are shrunk on the phone so they upload quickly on expo Wi-Fi.
3. **With the Sheet connected:** the booking, the screenshot and the logo go to the Google Apps Script. The page says "Booking received" only after the script has saved it.
4. **Without it, or if saving fails:** WhatsApp opens to AOD's number with the whole booking typed out, and the person attaches the screenshot (and the logo) in the chat.
