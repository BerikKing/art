import { readSite } from '../../lib/site-data.js';
import { LegalLayout, legalMetadata } from '../legal-page.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return legalMetadata(await readSite(), 'Privacy Notice', 'How this artist portfolio handles personal information.');
}

export default async function PrivacyPage() {
  const site = await readSite();
  const email = site.email;
  return <LegalLayout site={site} title="Privacy Notice">
    <p>Last updated: 31 October 2026.</p>
    <section><h2>Who we are</h2><p>This notice explains how {site.legalName || site.artistName || 'the artist'} handles personal information when you visit this portfolio or contact us about artwork, commissions, exhibitions or collaborations.</p></section>
    <section><h2>Information we receive</h2><p>When you contact us by email, telephone or WhatsApp, we may receive your name, contact details and the information you choose to include in your message. The website itself does not provide a public contact form or take card payments.</p></section>
    <section><h2>Why we use it</h2><p>We use this information to respond to enquiries, discuss and fulfil an order, arrange delivery, keep required business records, and protect the website and its administration. We rely on taking steps requested before a contract, performing a contract, meeting legal obligations, and legitimate interests in running the studio.</p></section>
    <section><h2>Sharing and international services</h2><p>Your information may be handled by service providers that help deliver email, messaging, website hosting or payment services. WhatsApp is operated by a separate provider when you choose to contact us through it. We only share information where needed to answer your enquiry, fulfil an order or meet a legal requirement.</p></section>
    <section><h2>Retention</h2><p>We keep enquiry information only for as long as needed to deal with it. Order and payment records are kept for the period required by tax and accounting law. We then delete or anonymise information where possible.</p></section>
    <section><h2>Your rights</h2><p>You can ask for access to, correction of or deletion of your personal information, and may have rights to restrict or object to its use. To make a request, contact {email ? <a href={`mailto:${email}`}>{email}</a> : 'us using the contact details below'}. You can also complain to the UK Information Commissioner’s Office.</p></section>
    <section><h2>Cookies and local storage</h2><p>The public portfolio does not use advertising or visitor tracking cookies. The site uses essential security session cookies and local storage only when an authorised administrator signs in to edit the website. If analytics, advertising or embedded third-party services are added later, this notice and the consent controls will be updated first.</p></section>
  </LegalLayout>;
}
