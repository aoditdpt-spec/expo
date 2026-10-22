// Settings for the expo page. Change these here, not in the page itself.
window.AOD_EXPO_CONFIG = {
  // Where requests go first: the address of the Google Apps Script web app in
  // google-apps-script/Code.gs (see sheetsguide.md), which adds each request to a Google Sheet.
  // While it's empty, the form hands the request to WhatsApp instead and says nothing was saved.
  submitUrl: "https://script.google.com/macros/s/AKfycbwredBXh1DoPkmoGpcSUoyW7egpQSkk4WgN0Uqu0JcTiwum4oJYiwG_0CwDHbr2OdIX/exec",

  // AOD's WhatsApp / phone and email.
  whatsappNumber: "919274739763",
  phoneDisplay: "+91 92747 39763",
  phoneHref: "tel:+919274739763",
  email: "communication.aod@gmail.com",
  instagramUrl: "https://www.instagram.com/artistsondemand.in/",
  siteUrl: "https://www.aod.co.in",

  // The reel in the middle of the hero (an MP4 in assets/media/, 9:16). It plays muted while on
  // screen, with a button for sound. With `src` empty, the box says "VIDEO HERE" instead.
  heroVideo: {
    src: "assets/media/gtz-reel.mp4",
    poster: "assets/media/gtz-reel.jpg",
    label: "Reel AOD made for GTZ's stall at Aluminium Bharat",
  },

  // The offer in the hero (price, what's included, sample reels) and in the Payment step.
  offer: {
    name: "1 reel and stall photos",
    price: 3499, // in rupees
    wasPrice: 5000, // shown struck through before the price; remove the line to hide it
    priceNote: "per day", // the price is for each shoot day: 2 days = 2 × price
    includes: [
      "Professional reel of your stall",
      "Stall photos",
      "Shot on high quality camera by a professional reel creator",
      "Ready to post while the expo is still on",
    ],
    // Sample reels (Google Drive links shared with "Anyone with the link").
    samples: [
      { label: "Sample reel 1", url: "https://drive.google.com/file/d/1UNto81t5s306cSk2WSOENgDiwkK7EwOz/view?usp=drivesdk" },
      { label: "Sample reel 2", url: "https://drive.google.com/file/d/1X3HAMVnIIOX33bToNWim8ZawQPDdfzVb/view?usp=drivesdk" },
    ],
  },

  // Payment, shown in the form's Payment step: the UPI ID (with a Copy button and, on phones, a
  // "Pay with a UPI app" button) and the QR image in assets/img/. payeeName is the name on the UPI
  // account. With both upiId and qrImage empty, the form asks people to get the payment details
  // from the AOD team at the expo.
  payment: {
    upiId: "thakkardhruvi5701@oksbi",
    payeeName: "Dhruvi Thakkar",
    qrImage: "assets/img/upi-qr.png",
    // Shown under the payment details. ({price} becomes the offer's price, e.g. "₹3,499".)
    note: "After paying, add the payment screenshot below.",
  },

  // Show "Another expo (type its name)" at the end of the expo list. Off for now: only the expos
  // in data/expos.js can be picked. (If none of them is still on, the name box shows anyway.)
  allowOtherExpo: false,
};
