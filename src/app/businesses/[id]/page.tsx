import { Metadata } from "next";
import { getBusiness } from "@/lib/api/businesses";
import { BusinessDetailClient } from "@/components/features/businesses/business-detail-client";
import { notFound } from "next/navigation";

interface BusinessDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BusinessDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await getBusiness(id);
    const business = response.data;
    const name = business.namePlace || "Negocio vegano";
    const typeLabel = business.typeBusiness ? `${business.typeBusiness} vegano` : "Negocio vegano";
    return {
      title: `${name} | Verde Guide`,
      description: `${typeLabel} en ${business.address}. Descubre más sobre este negocio.`,
      openGraph: {
        title: `${name} | Verde Guide`,
        description: `${typeLabel} en ${business.address}`,
        ...(business.image && { images: [{ url: business.image }] }),
      },
    };
  } catch {
    return {
      title: "Negocio | Verde Guide",
      description: "Detalles del negocio vegano seleccionado.",
    };
  }
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BusinessDetailClient businessId={resolvedParams.id} />
    </div>
  );
}
