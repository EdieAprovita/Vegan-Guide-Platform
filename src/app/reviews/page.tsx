import { Metadata } from 'next';
import Link from 'next/link';
import { ReviewsManagement } from '@/components/features/reviews/reviews-management';

export const metadata: Metadata = {
  title: 'Gestión de Reviews | Verde Guide',
  description: 'Administra y modera todas las reviews de la plataforma Verde Guide.',
};

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reviews</h1>
        <p className="text-gray-600">
          Administra y modera todas las reviews de la plataforma
        </p>
      </div>

      {/* Back to Home */}
      <div className="flex justify-start">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← Volver al Inicio
        </Link>
      </div>

      {/* Reviews Management Component */}
      <ReviewsManagement />
    </div>
  );
}
