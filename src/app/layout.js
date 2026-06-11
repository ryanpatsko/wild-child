import '../App.css';
import SiteChrome from '../components/SiteChrome';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const SITE_ORIGIN = 'https://wildchild-makeup.com';

export const metadata = {
  metadataBase: new URL(SITE_ORIGIN),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="App">
          <SiteChrome>{children}</SiteChrome>
        </div>
      </body>
    </html>
  );
}
