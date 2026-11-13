import Link from "next/link";
import { ArrowRight, BookOpenCheck, CircleHelp, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { getMessages, type Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

type Summary = {
  gross_paise: number;
  successful_count: number;
  refund_paise: number;
  gateway_fees_paise: number | null;
  net_settlement_paise: number | null;
  last_updated: string | null;
};

function inr(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString("en-IN")}`;
}

/** The public Trust Center. Only verified aggregate figures are shown; nothing here is invented. */
export function TrustCenter({ locale, summary }: { locale: Locale; summary: Summary | null }) {
  const t = getMessages(locale);
  const hi = locale !== "en";

  const figures: { label: string; value: string; note: string; icon: typeof Wallet }[] = summary
    ? [
        { label: inlineCopy(locale, "सफल योगदान (सकल)", "Gross successful contributions"), value: inr(summary.gross_paise), note: inlineCopy(locale, "सत्यापित सफल भुगतान का योग", "Sum of verified successful payments"), icon: Wallet },
        { label: inlineCopy(locale, "सफल लेन-देन", "Successful transactions"), value: Number(summary.successful_count).toLocaleString(hi ? "hi-IN" : "en-IN"), note: inlineCopy(locale, "गिनती की गई सत्यापित लेन-देन", "Count of verified payments"), icon: Receipt },
        { label: inlineCopy(locale, "सफल रिफंड", "Successful refunds"), value: inr(summary.refund_paise), note: inlineCopy(locale, "पूर्ण किए गए रिफंड", "Completed refunds"), icon: BookOpenCheck },
        { label: inlineCopy(locale, "सत्यापित गेटवे शुल्क", "Verified gateway fees"), value: summary.gateway_fees_paise === null ? (inlineCopy(locale, "उपलब्ध नहीं", "Not available")) : inr(summary.gateway_fees_paise), note: inlineCopy(locale, "प्रदाता द्वारा सत्यापित", "Confirmed by the provider"), icon: CircleHelp },
        { label: inlineCopy(locale, "शुद्ध बैंक निपटान", "Net bank settlements"), value: summary.net_settlement_paise === null ? (inlineCopy(locale, "मिलान नहीं हुआ", "Not reconciled")) : inr(summary.net_settlement_paise), note: inlineCopy(locale, "केवल मिलान किए जाने पर", "Only when reconciled"), icon: ShieldCheck },
      ]
    : [];

  return (
    <div className="trust-center">
      {summary ? (
        <>
          <div className="trust-figure-grid">
            {figures.map(({ label, value, note, icon: Icon }) => (
              <article className="trust-figure" key={label}>
                <span className="trust-figure-icon"><Icon size={18} aria-hidden="true" /></span>
                <h3>{label}</h3>
                <p className="trust-figure-value">{value}</p>
                <p className="trust-figure-note">{note}</p>
              </article>
            ))}
          </div>
          <p className="trust-updated">{inlineCopy(locale, "अंतिम सत्यापित अपडेट", "Last verified update")}: {summary.last_updated ? new Date(summary.last_updated).toLocaleString(hi ? "hi-IN" : "en-IN") : "—"}</p>
        </>
      ) : (
        <div className="status-banner">{t.emptyStats}</div>
      )}

      <section className="trust-explain" aria-labelledby="trust-money-title">
        <h2 id="trust-money-title">{inlineCopy(locale, "आपका रुपया कहाँ जाता है", "Where your rupee goes")}</h2>
        <ol className="trust-money-steps">
          <li><span>1</span><div><strong>{inlineCopy(locale, "आप चुनते हैं", "You choose")}</strong><p>{inlineCopy(locale, "कोई राशि अनिवार्य नहीं। आप पूरी तरह अपनी इच्छा से देते हैं।", "No amount is required. You give only if you want to.")}</p></div></li>
          <li><span>2</span><div><strong>{inlineCopy(locale, "भुगतान प्रदाता", "The payment provider")}</strong><p>{inlineCopy(locale, "भुगतान एक स्वीकृत प्रदाता के होस्टेड चेकआउट से होता है। JustGive आपका कार्ड या UPI विवरण सीधे संग्रह नहीं करता।", "Payment runs through an approved provider's hosted checkout. JustGive never collects your card or UPI details.")}</p></div></li>
          <li><span>3</span><div><strong>{inlineCopy(locale, "शुल्क अलग", "Fees are separate")}</strong><p>{inlineCopy(locale, "प्रदाता शुल्क काट सकता है, इसलिए आपकी राशि और बैंक में प्राप्त शुद्ध राशि अलग हो सकती है।", "The provider may deduct a fee, so your amount and the net amount received can differ.")}</p></div></li>
          <li><span>4</span><div><strong>{inlineCopy(locale, "मालिक को व्यक्तिगत रूप से", "To the owner personally")}</strong><p>{inlineCopy(locale, "राशि वेबसाइट मालिक को व्यक्तिगत रूप से मिलती है। यह चैरिटी, NGO या कर-छूट योग्य दान नहीं है।", "Funds go to the website owner personally. This is not a charity, NGO, or tax-deductible donation.")}</p></div></li>
        </ol>
      </section>

      <section className="trust-notclaimed" aria-labelledby="trust-not-title">
        <h2 id="trust-not-title">{inlineCopy(locale, "हम क्या दावा नहीं करते", "What we do not claim")}</h2>
        <ul>
          <li>{inlineCopy(locale, "चैरिटी, NGO, 80G या FCRA-अनुमोदित स्थिति", "Charitable, NGO, 80G, or FCRA-approved status")}</li>
          <li>{inlineCopy(locale, "कर छूट या धन का कोई प्रतिफल", "Any tax deduction or financial return")}</li>
          <li>{inlineCopy(locale, "भुगतान प्रदाता, बैंक या कानूनी पक्षों से गुमनामी", "Anonymity from providers, banks, or legal authorities")}</li>
          <li>{inlineCopy(locale, "कोई पुरस्कार, लॉटरी या लाभ", "Any prize, lottery, or benefit")}</li>
        </ul>
      </section>

      <section className="trust-changelog" aria-labelledby="trust-changes-title">
        <h2 id="trust-changes-title">{inlineCopy(locale, "बदलावों का रिकॉर्ड", "What has changed")}</h2>
        <p>{inlineCopy(locale, "नीति, आंकड़े या भुगतान से जुड़े बदलाव यहाँ समय के साथ दर्ज किए जाएँगे।", "Policy, figure, or payment changes will be recorded here over time.")}</p>
        <ul>
          <li><time dateTime="2026-11-12">{inlineCopy(locale, "12 नवंबर 2026", "12 November 2026")}</time>{inlineCopy(locale, "पारदर्शिता पृष्ठ को भाषा-सरल ट्रस्ट सेंटर में बदला गया।", "Transparency page rebuilt as a plain-language Trust Center.")}</li>
        </ul>
      </section>

      <p className="trust-back"><Link className="text-link" href={`/${locale}#give`}>{inlineCopy(locale, "योगदान करें", "Make an optional contribution")}<ArrowRight size={15} aria-hidden="true" /></Link></p>
    </div>
  );
}