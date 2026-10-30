import { ImageResponse } from 'next/og';
import { defaultLanguage, getCity } from './locale.js';
import { languages, localizedSite, readSite } from './site-data.js';

const imageSize = { width: 1200, height: 630 };

const roles = {
  ru: 'Художник · живопись и графика',
  en: 'Artist · painting and graphic art',
  uk: 'Художниця · живопис і графіка',
};

export async function createPortfolioImage(language) {
  const site = await readSite();
  const selectedLanguage = languages.includes(language) ? language : defaultLanguage(site);
  const localized = localizedSite(site, selectedLanguage);
  const fallbackNames = { ru: 'Портфолио художника', en: 'Artist portfolio', uk: 'Портфоліо художниці' };
  const name = site.artistName?.trim() || fallbackNames[selectedLanguage] || fallbackNames.en;
  const city = getCity(site, selectedLanguage);
  const description = String(localized.aboutTextSmall || localized.heroIntro || roles[selectedLanguage] || roles.en).replace(/\s+/g, ' ').trim().slice(0, 120);
  const topLine = [city, roles[selectedLanguage] || roles.en].filter(Boolean).join(' · ');

  return new ImageResponse(
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      padding: '64px',
      backgroundColor: site.paperColor,
      color: '#263b34',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        position: 'absolute',
        right: 0,
        top: 0,
        width: 390,
        height: 630,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 280,
        borderBottomLeftRadius: 280,
        backgroundColor: site.greenColor,
      }}>
        <div style={{
          display: 'flex',
          width: 245,
          height: 245,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 180,
          backgroundColor: site.paperColor,
        }}>
          <div style={{
            display: 'flex',
            width: 150,
            height: 150,
            borderRadius: 100,
            backgroundColor: site.accentColor,
          }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        width: 770,
        flexDirection: 'column',
      }}>
        <div style={{
          color: site.greenColor,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>{topLine}</div>
        <div style={{
          maxWidth: 700,
          marginTop: 38,
          fontSize: 70,
          fontWeight: 600,
          lineHeight: 1.05,
        }}>{name}</div>
        <div style={{
          maxWidth: 650,
          marginTop: 28,
          color: '#58665e',
          fontSize: 25,
          lineHeight: 1.4,
        }}>{description}</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 'auto',
          color: site.greenColor,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 4,
        }}>ARTIST PORTFOLIO</div>
      </div>
    </div>,
    imageSize,
  );
}
