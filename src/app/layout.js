import '../App.css';
import SiteChrome from '../components/SiteChrome';

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
