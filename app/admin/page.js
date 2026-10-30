import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin panel',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminPage() {
  const templatePath = path.join(process.cwd(), 'data', 'admin-template.html');
  const template = await readFile(templatePath, 'utf8');
  const body = template.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '<main>Admin template is missing.</main>';
  return <>
    <div dangerouslySetInnerHTML={{ __html: body }} />
    <Script src="/admin.js" strategy="afterInteractive" />
  </>;
}
