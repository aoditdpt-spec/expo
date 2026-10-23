# Saving expo bookings to Google Sheets

**Status: connected on 22 Oct 2026.** The Sheet and the script are on aod.itdpt@gmail.com, and the web app address is `submitUrl` in `config.js`. Keep this guide for redoing the setup or making another one. (Without a `submitUrl`, the form opens WhatsApp with the booking typed out and says nothing was saved.) Following these steps, every booking lands in a Google Sheet:

- a row on the **All expo bookings** tab
- a row on a tab named after the expo, such as **FIRSST 2026** (made by itself on the first booking for that expo)
- the **payment screenshot** saved in Google Drive, with its link in the row
- an **email** to the team for each booking

It takes about 10 minutes and needs no coding.

**Use the aod.itdpt@gmail.com account for every step**, the same Google account as the aod.co.in orders sheet (not communication.aod@gmail.com). Whichever account does the setup owns everything: the Sheet, the script, the Drive folders with the screenshots and logos, and the notification emails, which are sent from it.

> **Signed in to more than one Google account in this browser?** Apps Script often opens under the wrong account, or shows "Sorry, unable to open the file at this time". Do the setup in a window signed in **only** to aod.itdpt@gmail.com: a separate Chrome profile, or an incognito window where you sign in just that account.

---

## 1. Make the Sheet

1. Go to [sheets.new](https://sheets.new) to open a new blank Google Sheet. Check that the round account picture at the top right is **aod.itdpt@gmail.com**.
2. Name it, for example **AOD Expo Bookings**. Click "Untitled spreadsheet" at the top left to rename it.
3. Leave it empty. The tabs and their headings are made by themselves when the first booking arrives.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**. A new tab opens with a code editor.
2. Click "Untitled project" at the top and name it **AOD expo bookings**.
3. In the editor, delete everything in `Code.gs`, so the `function myFunction() {}` placeholder is gone.
4. Open `google-apps-script/Code.gs` from this project folder, copy **all** of it, and paste it into the editor.
5. Optional: check the settings at the top of the script.
   - `NOTIFY_EMAIL` is who gets an email for each booking: **communication.aod@gmail.com**, AOD's team inbox. The email is sent from aod.itdpt@gmail.com. Change the address to send it somewhere else, or put `""` for no emails.
   - `FOLDER_NAME` and `LOGO_FOLDER_NAME` are the Drive folders for the payment screenshots and the logos.
6. Press **Ctrl + S** to save.

## 3. Put it online (deploy it as a web app)

1. Click the blue **Deploy** button at the top right, then **New deployment**.
2. Click the gear ⚙ next to "Select type" and choose **Web app**.
3. Fill it in like this:
   - **Description:** `Expo bookings`
   - **Execute as:** **Me (aod.itdpt@gmail.com)**
   - **Who has access:** **Anyone**

   "Anyone" only means the booking page can send bookings to it. Nobody can read the Sheet through it.
4. Click **Deploy**.
5. Google asks for permission. Click **Authorize access** and pick **aod.itdpt@gmail.com**.
   - You'll see **"Google hasn't verified this app"**. That's normal for your own script. Click **Advanced**, then **Go to AOD expo bookings (unsafe)**.
   - Click **Allow**. The script asks to edit your spreadsheets (to add the rows), use Drive (to save the screenshots and logos) and send email as you (the team notification, from aod.itdpt@gmail.com).
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
   - **Google Drive:** the screenshot in **AOD expo payment screenshots**. Its link is in the row's "Payment screenshot" column.
   - **Email:** "New expo booking EXP-… · TEST · stall …" from aod.itdpt@gmail.com in the `NOTIFY_EMAIL` inbox (communication.aod@gmail.com unless you changed it).
4. Delete the test rows from both tabs and the test images from both Drive folders.

---

## What each column means

| Column | What's in it |
| --- | --- |
| Received at | When the booking arrived |
| Reference | The booking's reference (`EXP-YYMMDD-XXXX`), also shown to the exhibitor |
| Expo | The expo and its dates |
| Company | Company name |
| Company logo | Empty: the form no longer asks for a logo (removed 22 Oct 2026). The column stays so the headings line up with the rows; the script still saves a logo to **AOD expo company logos** if one is ever sent. |
| Stall | Stall number |
| Package | What they booked, from `offer` in `config.js` |
| Amount | What they should have paid, such as "₹3,499 (1 reel)" (one reel, one shoot day, per booking). Check it against the payment screenshot. |
| Contact person / Designation / Phone / Email | Their point of contact |
| Shoot dates | The day or days they picked (YYYY-MM-DD) |
| Brief for the artists | What they want shot (optional) |
| Payment screenshot | A link to the screenshot in Drive |
| Met by | The AOD team member, if the page was opened with `?by=Name` (see README) |
| Check | "Possible spam" if a hidden field that only bots fill was filled. The booking is still saved, so look at it before deleting. |
| Page | The page address it was sent from |

---

## Day-to-day

- **Share the Sheet with the team:** it belongs to aod.itdpt@gmail.com. Use **Share** at the top right and add each person's email (communication.aod@gmail.com too, if the team works from that inbox). Give **Editor** to people who update bookings and **Viewer** to people who only look. Never set it to "Anyone with the link": it holds phone numbers, emails and payment screenshots.
- **Share the screenshots and logos:** the Drive folders **AOD expo payment screenshots** and **AOD expo company logos** are in aod.itdpt@gmail.com's Drive and private to it. Share them too if teammates need to open the links.
- **Adding a new expo:** add it in `data/expos.js` (see `README.md`). Its tab appears in the Sheet with its first booking; nothing to change here.
- **Marking bookings done:** add your own columns to the **right** of "Page", such as "Payment checked", "Confirmed on WhatsApp" or "Reel delivered". The script only ever adds new rows and never touches existing ones.

## If you change the script later

(For example, after updating `Code.gs` from this folder when the form gets a new field. If the Sheet already has tabs from before, add the new column's heading by hand in the same place on each tab, so the headings still line up with the rows.) Make the change signed in as aod.itdpt@gmail.com.

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
| Rows arrive but no email | `NOTIFY_EMAIL` may be empty, or aod.itdpt@gmail.com has used its daily email limit (about 100 a day on a normal Gmail account). Check the spam folder too. |
| Apps Script says "Sorry, unable to open the file at this time", or shows a different account | You're signed in to several Google accounts. Use a window signed in only to aod.itdpt@gmail.com (see the note at the top). |
| You changed the script and nothing changed | You need a new **version** of the deployment (see above). |
| "Some details are missing" | The page and the script check the same fields; an older copy of the page may still be cached. Reload the page. |

## Privacy

The Sheet and the Drive folders hold people's phone numbers, emails and payment screenshots. Keep them private to the AOD team. Delete test rows. Don't copy bookings into personal accounts or WhatsApp groups that aren't AOD's.
