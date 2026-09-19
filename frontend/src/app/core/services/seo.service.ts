import { Injectable, inject, Inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { filter, map, mergeMap } from "rxjs/operators";

export interface SeoConfig {
  title?: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
  ogType?: string;
  schemaType?: string;
  noindex?: boolean;
}

/** Default SEO configuration for routes without explicit config */
const DEFAULT_PUBLIC_SEO: Partial<SeoConfig> = {
  robots: "index,follow",
  ogType: "website",
};

const DEFAULT_PRIVATE_SEO: Partial<SeoConfig> = {
  robots: "noindex,nofollow",
  noindex: true,
};

@Injectable({
  providedIn: "root",
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  private readonly SITE_NAME = "دَوَّرها";
  private readonly SITE_NAME_EN = "Dawwarha";
  private readonly BASE_URL = "https://dawwarha.com";
  private readonly DEFAULT_DESCRIPTION =
    "منصة دَوَّرها الرقمية لتدوير الموارد الفائضة وتوزيعها على المجتمعات المحتاجة. اعرض مواردك أو قدّم طلب احتياج الآن.";
  private readonly DEFAULT_LOCALE = "ar_SA";
  private readonly THEME_COLOR = "#0D9488"; // primary teal

  /**
   * Initialize the SEO service. Call once from AppComponent.
   * Listens to NavigationEnd events and applies route-level SEO config.
   */
  init(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          // Walk the route tree to find the deepest activated route
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === "primary"),
        mergeMap((route) => route.data),
      )
      .subscribe((data) => {
        const seo: SeoConfig = {
          title: data["title"],
          ...(data["seo"] || {}),
        };
        this.applySeo(seo);
      });
  }

  /**
   * Apply SEO configuration to the current page.
   * Can be called manually from components for dynamic content.
   */
  applySeo(config: SeoConfig): void {
    const isPrivate =
      config.noindex === true || this.isPrivateRoute(this.router.url);
    const defaults = isPrivate ? DEFAULT_PRIVATE_SEO : DEFAULT_PUBLIC_SEO;
    const merged = { ...defaults, ...config };

    // Title
    if (merged.title) {
      this.titleService.setTitle(merged.title);
    }

    // Meta description
    if (merged.description) {
      this.meta.updateTag({ name: "description", content: merged.description });
    } else if (!isPrivate) {
      this.meta.updateTag({
        name: "description",
        content: this.DEFAULT_DESCRIPTION,
      });
    } else {
      this.meta.removeTag('name="description"');
    }

    // Robots
    this.meta.updateTag({
      name: "robots",
      content: merged.robots || "index,follow",
    });

    // Canonical
    this.updateCanonical(merged.canonicalPath);

    if (!isPrivate && this.router.url.split("?")[0] === "/") {
      this.setJsonLd({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${this.BASE_URL}/#organization`,
            name: this.SITE_NAME,
            url: this.BASE_URL,
            logo: `${this.BASE_URL}/assets/logo/logo-full.png`,
          },
          {
            "@type": "WebSite",
            "@id": `${this.BASE_URL}/#website`,
            name: this.SITE_NAME,
            url: this.BASE_URL,
            inLanguage: "ar",
            publisher: { "@id": `${this.BASE_URL}/#organization` },
          },
        ],
      });
    } else {
      this.removeJsonLd();
    }

    // Open Graph (only for indexable pages)
    if (!isPrivate) {
      this.meta.updateTag({
        property: "og:title",
        content: merged.title || this.SITE_NAME,
      });
      this.meta.updateTag({
        property: "og:description",
        content: merged.description || this.DEFAULT_DESCRIPTION,
      });
      this.meta.updateTag({
        property: "og:type",
        content: merged.ogType || "website",
      });
      this.meta.updateTag({
        property: "og:site_name",
        content: this.SITE_NAME,
      });
      this.meta.updateTag({
        property: "og:locale",
        content: this.DEFAULT_LOCALE,
      });
      if (merged.canonicalPath) {
        this.meta.updateTag({
          property: "og:url",
          content: this.BASE_URL + merged.canonicalPath,
        });
      } else {
        this.meta.updateTag({
          property: "og:url",
          content: this.BASE_URL + this.router.url.split("?")[0],
        });
      }

      // Twitter Card
      this.meta.updateTag({ name: "twitter:card", content: "summary" });
      this.meta.updateTag({
        name: "twitter:title",
        content: merged.title || this.SITE_NAME,
      });
      this.meta.updateTag({
        name: "twitter:description",
        content: merged.description || this.DEFAULT_DESCRIPTION,
      });
    } else {
      // Remove OG/Twitter for private pages
      this.removeMetaByProperty("og:title");
      this.removeMetaByProperty("og:description");
      this.removeMetaByProperty("og:type");
      this.removeMetaByProperty("og:url");
      this.removeMetaByProperty("og:site_name");
      this.removeMetaByProperty("og:locale");
      this.meta.removeTag('name="twitter:card"');
      this.meta.removeTag('name="twitter:title"');
      this.meta.removeTag('name="twitter:description"');
    }
  }

  /**
   * Update or create the canonical link element.
   */
  private updateCanonical(path?: string): void {
    const url = path
      ? this.BASE_URL + path
      : this.BASE_URL + this.router.url.split("?")[0];
    let link = this.document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement("link");
      link.setAttribute("rel", "canonical");
      this.document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }

  /**
   * Inject JSON-LD structured data into the page head.
   * Removes any previous JSON-LD script before adding new one.
   */
  setJsonLd(schema: Record<string, any> | Record<string, any>[]): void {
    this.removeJsonLd();

    const script = this.document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "true");
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  private removeMetaByProperty(property: string): void {
    this.meta.removeTag(`property="${property}"`);
  }

  private removeJsonLd(): void {
    const existing = this.document.querySelectorAll(
      'script[type="application/ld+json"][data-seo="true"]',
    );
    existing.forEach((el) => el.remove());
  }

  private isPrivateRoute(url: string): boolean {
    const path = url.split("?")[0].replace(/\/$/, "") || "/";
    return (
      path === "/login" ||
      path === "/register" ||
      path === "/dashboard" ||
      path === "/profile" ||
      path === "/notifications" ||
      path === "/reports" ||
      path === "/matches" ||
      path.startsWith("/matches/") ||
      path === "/contributions" ||
      path === "/requests" ||
      path.startsWith("/requests/") ||
      path === "/resources/create" ||
      path === "/resources/mine" ||
      path.endsWith("/edit") ||
      path === "/organizations/register" ||
      path === "/organizations/dashboard" ||
      path === "/organizations/verification" ||
      path.startsWith("/admin") ||
      path.startsWith("/handovers/")
    );
  }
}
