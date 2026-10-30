import LocalizedLegalDocument, { localizedLegalMetadata } from '../legal-document.js';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) { return localizedLegalMetadata({ params, kind: 'cookies' }); }
export default function Page({ params }) { return <LocalizedLegalDocument params={params} kind="cookies" />; }
