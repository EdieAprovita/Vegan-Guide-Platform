import { Metadata } from 'next';
import { BusinessDetailClient } from '@/components/features/businesses/business-detail-client';
import { notFound } from 'next/navigation';

interface BusinessDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BusinessDetailPageProps): Promise<Metadata> {
  return {
    title: `Negocio | Verde Guide`,
    description: 'Detalles del negocio vegano seleccionado.',
  };
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BusinessDetailClient businessId={id} />
    </div>
  );
}
