# Artist portfolio — Next.js

This is the Next.js edition of the PHP project in the parent folder. The PHP edition is kept as-is; this folder has its own copy of `data/site.json`, its own administrator password, and its own uploaded images.

## Run locally

1. Install Node.js 20.9 or newer.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Open `/admin` and create an administrator password of at least 12 characters.

The website is available at `/`, `/ru`, `/en`, and `/uk`. Settings are stored in `data/site.json`; administrator credentials and session keys are private files in `data/`; uploaded images are stored in `public/uploads/`.

## Hosting

This edition needs a host that runs a persistent Node.js server. Start it with `npm run build` and `npm run start`. The server needs write access to `data/` and `public/uploads/`. Keep those directories on persistent storage and back them up. A PHP-only shared hosting plan cannot run this edition; keep using the PHP project there unless the plan supports Node.js applications.

Before deployment, set `SITE_URL` in the hosting environment to the site's canonical HTTPS origin, for example `https://artist.example.com`. The app uses it for canonical URLs, language alternates, structured data, sitemap, robots, and social preview images. If it is omitted, the app uses the incoming host and forwarded protocol, defaulting to HTTPS in production. The public pages read their title and description from the selected language's content in `data/site.json`.

After deployment, check `/robots.txt` and `/sitemap.xml`, then submit the sitemap URL to Google Search Console and Bing Webmaster Tools. The admin page is marked `noindex`; keep the actual artist name, city, introduction, and artwork details filled in through `/admin` for useful search snippets.

## UK sales readiness

The footer includes `/privacy` and `/terms`. Before taking orders from UK customers, open `/admin` and complete **Legal information**: the legal or business name, publication address, privacy email, and company/VAT numbers when applicable. The Terms of Sale are designed for enquiries and orders agreed directly with the buyer; confirm the exact artwork, price, delivery cost, delivery timeframe, payment method and taxes in writing before taking payment. Review these pages with the client whenever the host, payment provider, delivery regions or sales process changes.

For a standard Node.js host, install with `npm ci`, set `SITE_URL`, build with `npm run build`, and run `npm run start`. Configure the host or reverse proxy to pass HTTPS requests to the Node.js server. The deployment must keep `data/` and `public/uploads/` writable and persistent across restarts.

If the administrator password is lost, delete only `data/admin-auth.json` through the hosting file manager, then open `/admin` and create a new password. Do not remove `data/site.json` or `public/uploads/`.
# art
