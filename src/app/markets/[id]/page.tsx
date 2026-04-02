import { Metadata } from "next";
import { getMarket } from "@/lib/api/markets";
import { MarketDetailClient } from "../../../components/features/markets/market-detail-client";

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MarketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await getMarket(id);
    const market = response.data;
    const productsPreview =
      Array.isArray(market.products) && market.products.length > 0
        ? market.products.slice(0, 3).join(", ")
        : null;
    return {
      title: `${market.marketName} | Verde Guide`,
      description: productsPreview
        ? `Mercado vegano en ${market.address}. Productos: ${productsPreview}. Rating: ${market.rating}/5.`
        : `Mercado vegano en ${market.address}. Rating: ${market.rating}/5.`,
      openGraph: {
        title: `${market.marketName} | Verde Guide`,
        description: `Mercado vegano en ${market.address}`,
      },
    };
  } catch {
    return {
      title: "Mercado | Verde Guide",
      description: "Detalles del mercado vegano seleccionado.",
    };
  }
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { id } = await params;

  return <MarketDetailClient marketId={id} />;
}
