"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

export function RecommendationEngine() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <Sparkles className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Sign in for personalized recommendations
          </h2>
          <p className="text-gray-600">
            We&apos;ll learn your preferences and suggest the best vegan options for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Personalized Recommendations</h1>
          </div>
          <p className="text-gray-600">
            Discover the best vegan options tailored to your preferences and goals
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-2">
              <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-50" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Próximamente</h3>
            <p className="text-muted-foreground text-sm">Esta función estará disponible pronto.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
