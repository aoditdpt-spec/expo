# Saving expo bookings to Google Sheets

Right now the form has nowhere to save bookings, so it opens WhatsApp with the booking typed out and says nothing was saved. Follow these steps once and every booking lands in a Google Sheet instead:

- a row on the **All expo bookings** tab
- a row on a tab named after the expo, such as **FIRSST 2026** (made by itself on the first booking for that expo)
- the **payment screenshot** saved in a Google Drive folder, with its link in the row
- an **email** to the team for each booking

It takes about 10 minutes and needs no coding. Do it while signed in to the Google account that should own the bookings, ideally AOD's own account (communication.aod@gmail.com), not a personal one.

---

## 1. Make the Sheet

1. Go to [sheets.new](https://sheets.new) to open a new blank Google Sheet.
2. Name it, for example **AOD Expo Bookings**. Click "Untitled spreadsheet" at the top left to rename it.
3. Leave it empty. The tabs and their headings are made by themselves when the first booking arrives.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**. A new tab opens with a code editor.
2. Click "Untitled project" at the top and name it **AOD expo bookings**.
3. In the editor, delete everything in `Code.gs`, so the `function myFunction() {}` placeholder is gone.
4. Open `google-apps-script/Code.gs` from this project folder, copy **all** of it, and paste it into the editor.
5. Optional: check the settings at the top of the script.
   - `NOTIFY_EMAIL` is who gets an email for each booking. Put `""` for no emails.
   - `FOLDER_NAME` is the Drive folder for the payment screenshots.
6. Press **Ctrl + S** to save.

## 3. Put it online (deploy it as a web app)

1. Click the blue **Deploy** button at the top right, then **New deployment**.
2. Click the gear ⚙ next to "Select type" and choose **Web app**.
3. Fill it in like this:
   - **Description:** `Expo bookings`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**

   "Anyone" only means the booking page can send bookings to it. Nobody can read the Sheet through it.
4. Click **Deploy**.
5. Google asks for permission. Click **Authorize access** and pick the account.
   - You'll see **"Google hasn't verified this app"**. That's normal for your own script. Click **Advanced**, then **Go to AOD expo bookings (unsafe)**.
   - Click **Allow**. The script asks to edit your spreadsheets (to add the rows), use Drive (to save the screenshots) and send email as you (the team notification).
6. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy…/exec`.

**Check it works:** paste that address into a new browser tab. You should see:

```
{"ok":true,"service":"AOD expo bookings"}
```

## 4. Connect the page to the Sheet

1. Open `config.js` in this project folder.
2. Paste the address between the quotes of `submitUrl`:

   ```js
   submitUrl: "https://script.google.com/macros/s/AKfy…/exec",
   ```
3. Save the file and upload the site again (see "Putting the page online" in `README.md`).

The page now changes by itself:

- The button reads **"Book my stall reel"** instead of "Send on WhatsApp".
- After sending, it says **"Booking received"** with the reference, such as `EXP-261022-K3F9`.
- If the internet drops while saving, it says so and offers WhatsApp instead. It never claims a booking was saved when it wasn't.

## 5. Test it once

1. Open the page and fill in the form with test details: company "TEST", any stall number, your own phone and email, and any screenshot.
2. Press **Book my stall reel**. You should see **Booking received**.
3. Check that all three things happened:
   - **The Sheet:** a row on **All expo bookings** and on **FIRSST 2026**.
   - **Google Drive:** the screenshot in the **AOD expo payment screenshots** folder. Its link is in the row's "Payment screenshot" column.
   - **Email:** "New expo booking EXP-… · TEST · stall …" in the `NOTIFY_EMAIL` inbox.
4. Delete the test rows from both tabs and the test image from the Drive folder.

---

## What each column means

| Column | What's in it |
| --- | --- |
| Received at | When the booking arrived |
| Reference | The booking's reference (`EXP-YYMMDD-XXXX`), also shown to the exhibitor |
| Expo | The expo and its dates |
| Company | Company name |
| Stall | Stall number |
| Package | What they booked and the price, from `offer` in `config.js` |
| Contact person / Designation / Phone / Email | Their point of contact |
| Shoot dates | The day or days they picked (YYYY-MM-DD) |
| Brief for the artists | What they want shot (optional) |
| Payment screenshot | A link to the screenshot in Drive |
| Met by | The AOD team member, if the page was opened with `?by=Name` (see README) |
| Check | "Possible spam" if a hidden field that only bots fill was filled. The booking is still saved, so look at it before deleting. |
| Page | The page address it was sent from |

---

## Day-to-day

- **Share the Sheet with the team:** use **Share** at the top right and add each person's email. Give **Editor** to people who update bookings and **Viewer** to people who only look. Never set it to "Anyone with the link": it holds phone numbers, emails and payment screenshots.
- **Share the screenshots:** the Drive folder **AOD expo payment screenshots** is private to the account that runs the script. Share the folder too if teammates need to open the screenshot links.
- **Adding a new expo:** add it in `data/expos.js` (see `README.md`). Its tab appears in the Sheet with its first booking; nothing to change here.
- **Marking bookings done:** add your own columns to the **right** of "Page", such as "Payment checked", "Confirmed on WhatsApp" or "Reel delivered". The script only ever adds new rows and never touches existing ones.

## If you change the script later

Editing the code isn't enough; the live version only changes when you deploy it again:

1. **Deploy → Manage deployments**.
2. Click the **pencil ✏** on the existing deployment.
3. Under **Version**, choose **New version**.
4. Click **Deploy**.

The address stays the same, so `config.js` needs no change. Avoid **New deployment** here: it makes a *new* address, and then the page would need it.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| The page says "We couldn't save your booking just now" | Open the `/exec` address in a browser and check for `{"ok":true…}`. If it's a Google sign-in page or an error, redo step 3 and check that **Who has access** is **Anyone**. |
| The `/exec` address works but nothing saves | In Apps Script, open **Executions** (the ☰ list icon on the left) and read the error on the latest `doPost`. |
| "Authorization is required" in Executions | Run any function once from the editor (choose `doGet` at the top and press ▶ Run) and allow the permissions again. |
| Rows arrive but no email | `NOTIFY_EMAIL` may be empty, or the account has used its daily email limit (about 100 a day on a normal Gmail account). Check the spam folder too. |
| You changed the script and nothing changed | You need a new **version** of the deployment (see above). |
| "Some details are missing" | The page and the script check the same fields; an older copy of the page may still be cached. Reload the page. |

## Privacy

The Sheet and the Drive folder hold people's phone numbers, emails and payment screenshots. Keep both private to the AOD team. Delete test rows. Don't copy bookings into personal accounts or WhatsApp groups that aren't AOD's.
