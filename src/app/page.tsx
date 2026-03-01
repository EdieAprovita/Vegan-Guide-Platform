import { VeganLandingPage } from "@/components/vegan-landing/landing-page";
import {
  WebsiteJsonLd,
  OrganizationJsonLd,
} from "@/lib/seo/json-ld";

export default function Home() {
  return (
    <>
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <VeganLandingPage />
    </>
  );
}
