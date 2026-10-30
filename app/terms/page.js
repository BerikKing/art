import { readSite } from '../../lib/site-data.js';
import { LegalLayout, legalMetadata } from '../legal-page.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return legalMetadata(await readSite(), 'Terms of Sale', 'Terms for purchasing original artwork and commissions.');
}

export default async function TermsPage() {
  const site = await readSite();
  const email = site.email;
  return <LegalLayout site={site} title="Terms of Sale">
    <p>Last updated: 31 October 2026.</p>
    <section><h2>Orders</h2><p>Artwork enquiries made through this website, email, telephone or WhatsApp do not create a contract. Before payment is requested, we will confirm in writing the artwork, total price, currency, payment method, delivery destination, delivery cost, estimated delivery time and any applicable taxes.</p></section>
    <section><h2>Availability and images</h2><p>Availability is confirmed before an order is accepted. Colours can vary between screens, so images are a guide only. Dimensions and medium for each work will be confirmed in the order details.</p></section>
    <section><h2>Delivery</h2><p>Delivery method, insurance, cost and timeframe are agreed before payment. Unless another timeframe is agreed in writing, goods will be delivered within 30 days after the contract is made. Please inspect a delivered artwork promptly and contact us if it arrives damaged.</p></section>
    <section><h2>Cancellations and returns</h2><p>For eligible ready-made artwork bought at a distance, UK consumers can normally cancel within 14 days of delivery. Tell us clearly that you wish to cancel before the period ends. Return instructions and the return address will be provided after contact. This cancellation right does not normally apply to works made to your specifications or clearly personalised. These terms do not affect rights where artwork is faulty, damaged or not as described.</p></section>
    <section><h2>Commissions</h2><p>The brief, price, deposit, approval stages, delivery timeframe, cancellation terms and intellectual-property permissions for a commission are agreed in writing before work begins. A commission may be personalised or made to the buyer’s specifications, which can affect cancellation rights.</p></section>
    <section><h2>Copyright</h2><p>The artist keeps copyright in the artwork unless a separate written agreement says otherwise. Buying an original work does not transfer the right to reproduce it commercially.</p></section>
    <section><h2>Questions or complaints</h2><p>{email ? <>Contact <a href={`mailto:${email}`}>{email}</a> with any question or complaint. </> : 'Contact us using the details below with any question or complaint. '}We will try to resolve it promptly.</p></section>
  </LegalLayout>;
}
