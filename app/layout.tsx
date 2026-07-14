import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mahoney Digital | Websites for Ohio Contractors & Local Businesses",
    template: "%s | Mahoney Digital",
  },
  description: "Fast, mobile-first websites with honest pricing for contractors, trades, and local operators in Ohio. No fluff. No surprise bills. Built to bring in more calls.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["website design Ohio", "contractor websites Chillicothe", "trades website design", "local business websites Ohio", "fast mobile websites", "honest pricing websites"],
  authors: [{ name: "Jeremy Mahoney", url: "https://mahoneydigital.net" }],
  openGraph: {
    title: "Mahoney Digital | Professional Websites for Local Ohio Businesses",
    description: "Stop overpaying for slow templates. Get a fast, conversion-focused site built for contractors and trades who want results without the agency markup.",
    images: [{ url: "/og-image.jpg" }], // TODO: Replace with actual optimized OG image
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahoney Digital | Websites for Ohio Contractors & Local Businesses",
    description: "Fast, honest websites that help local trades and contractors get more calls.",
    images: [{ url: "/og-image.jpg" }],
  },
  alternates: {
    canonical: "https://mahoneydigital.net",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* LocalBusiness structured data for local SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Mahoney Digital",
              "description": "Professional websites for Ohio contractors, trades, and local service businesses.",
              "url": "https://mahoneydigital.net",
              "telephone": "+17404928601",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Chillicothe",
                "addressRegion": "OH",
                "addressCountry": "US"
              },
              "founder": {
                "@type": "Person",
                "name": "Jeremy Mahoney"
              },
              "areaServed": "Ohio",
              "serviceType": "Website Design and Development"
            })
          }}
        />
      </body>
    </html>
  );
}
