import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-family',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-head-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agudo Construction - Together, We Build Stronger',
  description: 'Licensed construction services with transparent pricing. Book engineers, estimate costs, and track projects online. Agudo Construction - Together, We Build Stronger.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <Script id="remove-extension-hydration-attrs" strategy="beforeInteractive">
          {`
            (function () {
              var ATTRS = ['fdprocessedid'];

              function clean(root) {
                if (!root || root.nodeType !== 1) return;

                ATTRS.forEach(function (attr) {
                  if (root.hasAttribute && root.hasAttribute(attr)) {
                    root.removeAttribute(attr);
                  }
                });

                if (!root.querySelectorAll) return;
                ATTRS.forEach(function (attr) {
                  root.querySelectorAll('[' + attr + ']').forEach(function (node) {
                    node.removeAttribute(attr);
                  });
                });
              }

              clean(document.documentElement);

              var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                  if (mutation.type === 'attributes') {
                    clean(mutation.target);
                  }

                  mutation.addedNodes.forEach(clean);
                });
              });

              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ATTRS,
                childList: true,
                subtree: true
              });

              window.addEventListener('load', function () {
                clean(document.documentElement);
                window.setTimeout(function () {
                  clean(document.documentElement);
                  observer.disconnect();
                }, 900);
              });
            })();
          `}
        </Script>
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
