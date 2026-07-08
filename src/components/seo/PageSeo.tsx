import { Helmet } from "react-helmet-async";
import { ReactNode } from "react";

const SITE_URL = "https://elrugido.com";

export interface PageSeoProps {
  /** Page title (without brand suffix). Brand is appended automatically. */
  title: string;
  /** Meta description (≤160 chars). */
  description: string;
  /** Absolute or root-relative path for canonical / og:url (e.g. "/santos"). */
  path: string;
  /** og:type — defaults to "website". Use "article" for gospel/reflections. */
  ogType?: "website" | "article";
  /** Absolute image URL for social share. */
  image?: string;
  /** Optional JSON-LD objects to inject (Article, FAQPage, BreadcrumbList, etc.). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Set true on non-indexable pages (auth, admin, drafts). */
  noindex?: boolean;
  /** Extra <Helmet> children when needed. */
  children?: ReactNode;
}

/**
 * Reusable SEO wrapper for public pages. Emits title, meta description,
 * canonical, Open Graph and optional JSON-LD in a single place.
 *
 * Usage:
 *   <PageSeo
 *     title="Santos católicos"
 *     description="Explora la vida de 420+ santos del calendario litúrgico."
 *     path="/santos"
 *   />
 */
export const PageSeo = ({
  title,
  description,
  path,
  ogType = "website",
  image = `${SITE_URL}/logo-elrugido.png`,
  jsonLd,
  noindex = false,
  children,
}: PageSeoProps) => {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const fullTitle = title.includes("ElRugido") ? title : `${title} | ElRugido`;
  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {blocks.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
      {children}
    </Helmet>
  );
};

/**
 * Canonical author for Evangelio del día and reflexiones diarias.
 * Use inside an Article JSON-LD as { author: gospelAuthor() }.
 */
export const gospelAuthor = () => ({
  "@type": "Person",
  name: "P. Luis Zazano",
  jobTitle: "Sacerdote católico · Reflexiones del Evangelio",
  affiliation: { "@type": "Organization", name: "ElRugido", url: SITE_URL },
});

export const orgPublisher = () => ({
  "@type": "Organization",
  name: "ElRugido",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-elrugido.png` },
});
