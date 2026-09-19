# Dawwarha — SEO Skills Used

This is an evidence log, not a claim that ten external skill packages were installed. No verified external SEO skill package was available in the workspace, so implementation used Angular APIs, web standards, and official documentation concepts. Browser and Lighthouse items are documented as not run where applicable.

| #   | Category              | Skill / Tool                                | Source                                             | How Used                                                                                |
| --- | --------------------- | ------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Technical SEO         | Angular `Meta` + `Title` services           | `@angular/platform-browser` (built-in)             | Centralized `SeoService` for meta tag management                                        |
| 2   | Technical SEO         | Angular `TitleStrategy`                     | `@angular/router` (built-in)                       | Custom `SeoTitleStrategy` for route-level SEO                                           |
| 3   | On-Page SEO           | Manual audit + implementation               | Google Search Central documentation                | Unique titles, descriptions, H1 hierarchy per route                                     |
| 4   | Structured Data       | JSON-LD injection via `DOCUMENT` token      | Schema.org vocabulary, Google Structured Data docs | Organization, WebSite, WebPage, BreadcrumbList, HowTo schemas                           |
| 5   | Core Web Vitals       | Lighthouse CLI + Chrome DevTools            | Google Lighthouse (built into Chromium)            | LCP, INP, CLS, TTFB measurements                                                        |
| 6   | Sitemap               | Manual XML generation                       | Sitemaps.org protocol                              | Static `sitemap.xml` for 4 verified static public routes                                |
| 7   | Robots                | Manual `robots.txt` creation                | robotstxt.org specification                        | Disallow private/admin routes, reference sitemap                                        |
| 8   | SPA SEO               | CSR rendering analysis + meta tag injection | Google JavaScript SEO documentation                | Evaluate crawler rendering of Angular CSR app                                           |
| 9   | Keyword / Content SEO | Manual search intent analysis               | Google Search Central content guidelines           | Semantic keyword mapping per public route                                               |
| 10  | Internal Linking      | Template + navigation audit                 | Web best practices                                 | Crawlable `<a routerLink>` links, footer links, breadcrumbs                             |
| 11  | Image SEO             | Alt text audit + lazy loading + dimensions  | Google Image SEO best practices                    | Proper `alt`, `width`/`height`, `loading="lazy"`                                        |
| 12  | AEO / GEO             | `llms.txt` + structured content             | llms.txt proposal and structured content guidance  | Added a supplemental machine-readable site description; no visibility guarantee claimed |
| 13  | Social / SERP         | Open Graph + Twitter Card                   | Open Graph Protocol, Twitter Cards docs            | OG and Twitter meta tags for share previews                                             |
| 14  | Accessibility         | Semantic HTML + ARIA audit                  | WCAG 2.1 AA guidelines                             | Landmarks, heading hierarchy, aria-labels                                               |
| 15  | Browser Validation    | CDP automation + curl                       | Chromium DevTools Protocol                         | Real browser verification of meta tags on every route                                   |

## Notes

- No external SEO "skill packages" were downloaded from third-party repositories. All SEO implementation uses **Angular built-in APIs**, **web standards**, and **Google's official documentation** as authoritative sources.
- Schema.org vocabulary is used conservatively for Organization and WebSite.
- Google Search Central documentation was the primary reference for crawlability, indexability, and structured data decisions.
