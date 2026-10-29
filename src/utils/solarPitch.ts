export interface ScriptItem {
  id: string;
  title: string;
  language: 'Telugu' | 'English';
  content: string;
}

export const SOLAR_PITCH_SCRIPTS: ScriptItem[] = [
  {
    id: 'telugu-intro',
    title: 'Telugu Direct Intro (Best for AP Vendors)',
    language: 'Telugu',
    content: `నమస్కారం సార్! నా పేరు దుర్గ, తేజో భారత్ గ్లోబల్ ఎనర్జీ (Tejo Bharat Global Energy) నుండి మాట్లాడుతున్నాను.

మీరు అనకాపల్లి జిల్లాలో సోలార్ ఇన్స్టాలేషన్స్ మరియు పిఎం సూర్య ఘర్ ప్రాజెక్ట్స్ చేస్తున్నట్లు చూశాము. 
మేము డైరెక్ట్ గా సోలార్ ప్యానెల్స్ (Tier-1 DCR & Non-DCR Mono PERC, TOPCon 550W+) డీలర్ మరియు హోల్‌సేల్ ప్రైస్‌కే సప్లై చేస్తున్నాము. 

మీ రాబోయే ప్రాజెక్ట్స్ కోసం రెడీ స్టాక్ మరియు బెస్ట్ రేట్స్ కావాలంటే వెంటనే డిస్పాచ్ చేయగలం సార్. మీ కరెంట్ రిక్వైర్మెంట్ ఏమైనా ఉందా సార్?`
  },
  {
    id: 'english-intro',
    title: 'English Professional Pitch',
    language: 'English',
    content: `Hello Sir/Madam! This is Durga calling from Tejo Bharat Global Energy LLP.

I noticed your active solar installations under PM Surya Ghar and rooftop projects in the district. 
We are supplying Tier-1 DCR and Non-DCR Solar Modules (Mono PERC & TOPCon 550Wp+) directly to solar contractors with verified ALMM compliance, 25-year warranty, and prompt delivery across Andhra Pradesh.

We are currently offering very attractive wholesale margins for registered solar vendors. May I share our latest price list on WhatsApp?`
  },
  {
    id: 'objection-existing-supplier',
    title: 'Objection: "We already have a regular distributor"',
    language: 'Telugu',
    content: `చాలా బాగుంది సార్! ఖచ్చితంగా మీరు ఆల్రెడీ ఒకరి దగ్గర తీసుకుంటుంటారు. కానీ తేజో భారత్ నుండి మేము ఇచ్చే అడ్వాంటేజ్ ఏంటంటే:
1. లోకల్ ఆంధ్రప్రదేశ్ లోనే రెడీ స్టాక్ ఉంటుంది - ట్రాన్స్‌పోర్ట్ డిలేస్ ఉండవు.
2. పక్కా జీఎస్టీ బిల్లింగ్ (8.9% GST compliant for solar) మరియు పిఎం సూర్య ఘర్ డిబిటి అప్రూవల్స్ కి పూర్తి డాక్యుమెంటేషన్.
3. మీ రెగ్యులర్ రేటు కంటే వాట్ కి 30-50 పైసలు బెటర్ మార్జిన్ ఇవ్వగలం.

ఒక్కసారి మా కొటేషన్ చూడండి సార్, నచ్చితేనే ఒక చిన్న ఆర్డర్ తో టెస్ట్ చేయండి.`
  },
  {
    id: 'objection-pricing',
    title: 'Objection: "What is your rate per watt?"',
    language: 'English',
    content: `Our rates depend on whether you need DCR (for PM Surya Ghar residential subsidy claims) or Non-DCR (for commercial/industrial roofs):
• DCR Mono PERC 545W/550W: Best market-competitive dealer rate with full ALMM certificate.
• Non-DCR TOPCon 550W+ Bifacial: Ultra high efficiency up to 22.5% at aggressive bulk pallet pricing.
• Immediate dispatch from our regional hub.

If you share your quantity (kW or pallets), I will immediately WhatsApp the exact quote with GST breakdown!`
  },
  {
    id: 'whatsapp-quick-text',
    title: 'WhatsApp Follow-Up Text Template',
    language: 'English',
    content: `*Tejo Bharat Global Energy LLP - Solar Modules Price & Stock Offer* 🌞

Dear Partner,
Thank you for speaking with us. Here is our solar module availability for your PM Surya Ghar & Rooftop projects:

✅ Tier-1 ALMM & BIS Approved
✅ DCR Compliant (540W - 550W Mono PERC)
✅ High-Efficiency TOPCon Bifacial
✅ 25-Year Performance Warranty
✅ Ready Stock in Andhra Pradesh & Telangana

📞 Call/WhatsApp: +91 94797 97947
🌐 Web: www.tejobharat.com
Address: Tejo Bharat Global Energy LLP`
  }
];

export const FREQUENT_SOLAR_NOTES = [
  "Interested in 10kW DCR panels for upcoming PM Surya Ghar installation",
  "Requested dealer quotation on WhatsApp",
  "Line busy - Call back in the evening",
  "Already has stock, asked to follow up next month",
  "Looking for TOPCon 550W+ Bifacial panels",
  "Asked to share ALMM certificate and datasheet",
  "Very interested - High priority lead! Scheduled follow-up",
  "Ringing, no answer after multiple rings",
  "Switched off / out of coverage",
  "Deal finalized - Agreed on solar module pricing"
];
