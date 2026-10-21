// Settings for the expo page. Change these here, not in the page itself.
window.AOD_EXPO_CONFIG = {
  // Where requests go first: the address of the Google Apps Script web app in
  // google-apps-script/Code.gs (see README.md), which adds each request to a Google Sheet.
  // While it's empty, the form hands the request to WhatsApp instead and says nothing was saved.
  submitUrl: "",

  // AOD's WhatsApp / phone and email.
  whatsappNumber: "919274739763",
  phoneDisplay: "+91 92747 39763",
  phoneHref: "tel:+919274739763",
  email: "communication.aod@gmail.com",
  instagramUrl: "https://www.instagram.com/artistsondemand.in/",
  siteUrl: "https://www.aod.co.in",

  // The offer in the hero (price, what's included, sample reels) and in the Payment step.
  offer: {
    name: "1 reel and a few stall photos",
    price: 3500, // in rupees
    priceNote: "per stall",
    includes: [
      "A professional reel of your stall",
      "A few stall photos",
      "Shot on an iPhone 16 Pro Max by a professional reel creator",
      "Ready to post while the expo is still on",
    ],
    // Sample reels (Google Drive links shared with "Anyone with the link").
    samples: [
      { label: "Sample reel 1", url: "https://drive.google.com/file/d/1UNto81t5s306cSk2WSOENgDiwkK7EwOz/view?usp=drivesdk" },
      { label: "Sample reel 2", url: "https://drive.google.com/file/d/1X3HAMVnIIOX33bToNWim8ZawQPDdfzVb/view?usp=drivesdk" },
    ],
  },

  // Payment, shown in the form's Payment step. Fill in AOD's UPI ID (e.g. "aod@okicici") and,
  // optionally, a QR image saved in assets/img/ (e.g. "assets/img/upi-qr.png"). While both are
  // empty the form asks people to get the payment details from the AOD team at the expo.
  payment: {
    upiId: "",
    payeeName: "Artists on Demand",
    qrImage: "",
    // {price} becomes the offer's price, e.g. "₹3,500".
    note: "Pay {price} for the expo reel (or the amount the AOD team shared with you for more), then add the screenshot below.",
  },

  // Show "Another expo (type its name)" at the end of the expo list. Off for now: only the expos
  // in data/expos.js can be picked. (If none of them is still on, the name box shows anyway.)
  allowOtherExpo: false,
};
