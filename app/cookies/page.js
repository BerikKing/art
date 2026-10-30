import { readSite } from '../../lib/site-data.js';
import { LegalLayout, legalMetadata } from '../legal-page.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return legalMetadata(await readSite(), 'Cookie Notice', 'Information about cookies and local storage used by this website.');
}

export default async function CookiesPage() {
  const site = await readSite();
  return <LegalLayout site={site} title="Cookie Notice">
    <p>Last updated: 31 October 2026.</p>
    <section><h2>What we use</h2><p>The public portfolio does not use analytics, advertising, social-media tracking or marketing cookies. The public website can be viewed without accepting optional cookies.</p></section>
    <section><h2>Essential administration cookie</h2><p>When an authorised administrator signs in at /admin, the website sets an essential, secure session cookie. It is used only to keep the editing session authenticated and expires after inactivity. Visitors do not receive this cookie unless they use the administration area.</p></section>
    <section><h2>Local storage</h2><p>The website stores your acknowledgement of this notice in your browser so the notice is not shown repeatedly. The administration area also stores the editor’s language preference and activity time locally for its security and usability.</p></section>
    <section><h2>Your choices</h2><p>You can delete cookies and local storage through your browser settings. If analytics, advertising or third-party embedded services are added in future, this notice will be updated and any required choices will be shown before those technologies are used.</p></section>
  </LegalLayout>;
}
