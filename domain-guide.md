# Putting the expo page on expos.aod.co.in

The page is live at `https://expo-two-ochre.vercel.app/` (the **expo** project on Vercel). These steps give it the address **expos.aod.co.in**. It takes about 10 minutes plus a short wait for DNS.

- **Vercel:** the domain is added to the **expo** project, not the **aod** project. The aod project keeps aod.co.in, www, artists, admin and resolve; nothing there changes.
- **GoDaddy:** aod.co.in's DNS is there (the same place as the artists, admin and resolve records, and Resend's email records). Two records are added; nothing existing is touched.
- **HTTPS:** aod.co.in tells browsers to use HTTPS on every subdomain. Vercel gives expos.aod.co.in a certificate by itself, so nothing extra is needed.

---

## 1. Add the address in Vercel

1. Go to [vercel.com](https://vercel.com), open the **expo** project (the one whose address is expo-two-ochre.vercel.app), then **Settings** → **Domains** in the left list.
2. Click **Add Domain** (it may say **Add Existing**). Type `expos.aod.co.in`.
   - If it asks how to connect it, keep **Connect to an environment: Production**, not Redirect.
   - Click **Add**.
3. The domain appears with **Invalid Configuration** and the record(s) it needs, usually:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `expos` | the value Vercel shows, such as `abc123.vercel-dns-017.com` (use its copy button) |
   | TXT | `_vercel` | `vc-domain-verify=expos.aod.co.in,…` (only if Vercel asks for it) |

   The TXT record appears when the expo project is in a different Vercel account or team from the aod project; it proves the address is yours. If Vercel shows only the CNAME, add only that.

Keep this tab open.

## 2. Add the records at GoDaddy

1. In a new tab: [godaddy.com](https://godaddy.com) → **Sign In** → your name (top right) → **My Products** → next to **aod.co.in**, click **DNS**.
2. Click **Add New Record**:
   - **Type:** CNAME
   - **Name:** `expos`. Only this part; GoDaddy adds `.aod.co.in` itself.
   - **Value:** paste the CNAME value from Vercel.
   - **TTL:** leave the default (1 Hour). Click **Save**.
3. If Vercel showed a TXT record, click **Add New Record** again:
   - **Type:** TXT
   - **Name:** `_vercel`
   - **Value:** paste the `vc-domain-verify=…` value from Vercel.
   - Click **Save**.

   There may already be a `_vercel` TXT record from the artists, admin and resolve setup. That's fine: add a **new** one; don't edit the old one. Several `_vercel` TXT records can sit side by side.

## 3. Wait for Vercel to check

Back in the Vercel tab, the domain turns to **Valid Configuration**. With GoDaddy that usually takes 5 to 30 minutes (sometimes up to a few hours). Vercel then issues the HTTPS certificate by itself.

To check from your computer (in PowerShell or Command Prompt):

```
nslookup -type=CNAME expos.aod.co.in
```

It should show the Vercel value you pasted.

## 4. Check it works

Open **https://expos.aod.co.in** on a phone and a laptop:

- the page opens with the hero, the logos and the form;
- `https://expos.aod.co.in/?expo=iif-2026` opens with the hero congratulating on IIF 2026;
- a booking still saves to the Google Sheet. The Apps Script accepts bookings from any address, so nothing changes there; the Sheet's **Page** column will just show the new address.

## 5. After it works

- **New QR codes: done** (23 Oct 2026). The QR codes in `qr/` point straight at expos.aod.co.in. Old printed ones (expo-two-ochre.vercel.app) keep working as long as that address does.
- **Old link and old QR codes:** send them to the new address (step 6).
- **Optional:** link the page from aod.co.in, for example in the footer or the More menu.

## 6. Send the old link and old QR codes to the new address

Do this only **after** step 4 works. Before that, the redirect would send people to an address that doesn't open yet.

Anyone opening `https://expo-two-ochre.vercel.app/…`, including by scanning an old QR code, should land on the same page at expos.aod.co.in. The rest of the link is kept: `…vercel.app/?expo=iif-2026&by=Riya` goes to `expos.aod.co.in/?expo=iif-2026&by=Riya`.

**Option A (recommended): a `vercel.json` in this project.** It's in the code, so it's kept with the page and visible on GitHub. Create `vercel.json` next to `index.html` with:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "expo-two-ochre.vercel.app" }],
      "destination": "https://expos.aod.co.in/:path*",
      "permanent": true
    }
  ]
}
```

Then push. Only the old address is redirected (the `host` rule). Vercel's preview links and expos.aod.co.in itself are untouched, and the query part (`?expo=…`, `?by=…`) carries over.

**Option B: in Vercel's settings, no code.** Expo project → **Settings** → **Domains** → next to `expo-two-ochre.vercel.app`, click **Edit** → choose **Redirect to** `expos.aod.co.in` with **308 Permanent Redirect** → **Save**. If Vercel doesn't offer a redirect for the vercel.app address, use option A.

**Check it.** Open `https://expo-two-ochre.vercel.app/?expo=iif-2026` on a phone; the address bar should change to `https://expos.aod.co.in/?expo=iif-2026`. Scan an old QR code too.

**Afterwards:** print new QR codes that point straight at expos.aod.co.in, so nobody depends on the redirect. Keep the expo project's vercel.app address; don't delete or rename it, or the old QR codes stop working.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| Vercel still says **Invalid Configuration** after an hour | In GoDaddy, check the CNAME **Name** is just `expos` (not `expos.aod.co.in`) and the **Value** matches Vercel's exactly. Remove any other record named `expos`. |
| "The domain is already in use" in Vercel | It was added to another project (perhaps aod). Remove it there first (that project → Settings → Domains), then add it to the expo project. |
| The address opens the aod.co.in site instead | The domain was added to the **aod** project. Remove it there and add it to the **expo** project. |
| "Not secure" / certificate warning | Vercel is still issuing the certificate; wait 10 minutes and reload. |
