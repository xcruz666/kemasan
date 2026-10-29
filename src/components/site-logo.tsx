import Image from "next/image";
import { LandingIcon } from "@/components/landing-icon";
import { uploadUrl } from "@/lib/content/image-ref";
import { DEFAULT_SITE, type SiteLogo as SiteLogoSettings } from "@/lib/content/settings-shared";

/** Header and footer logo from Situs & SEO: the designed wordmark, or an uploaded image. */
export function SiteLogo({
  logo = DEFAULT_SITE.logo,
  siteName,
}: {
  logo?: SiteLogoSettings;
  siteName: string;
}) {
  if (logo.mode === "image" && logo.image) {
    return (
      <a className="brand brand-image" href="/" aria-label={`${siteName}, beranda`}>
        <Image
          src={uploadUrl(logo.image.file)}
          alt={siteName}
          width={logo.image.width}
          height={logo.image.height}
          unoptimized
        />
      </a>
    );
  }

  return (
    <a className="brand" href="/" aria-label={`${siteName}, beranda`}>
      <span className="brand-mark">
        <LandingIcon name={logo.icon} size={29} strokeWidth={1.7} />
      </span>
      <span>
        {logo.word}
        {logo.accent && <span className="brand-period">{logo.accent}</span>}
        {logo.subtitle && <small>{logo.subtitle}</small>}
      </span>
    </a>
  );
}
