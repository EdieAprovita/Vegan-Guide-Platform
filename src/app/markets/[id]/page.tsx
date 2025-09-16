import { MarketDetailClient } from "../../../components/features/markets/market-detail-client";

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { id } = await params;

  return <MarketDetailClient marketId={id} />;
}
