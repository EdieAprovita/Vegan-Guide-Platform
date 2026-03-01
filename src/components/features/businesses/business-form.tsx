"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, ImageIcon } from "lucide-react";
import { useBusinessMutations } from "@/hooks/useBusinesses";
import { CreateBusinessData } from "@/lib/api/businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  "Tienda de Alimentos",
  "Restaurante",
  "Café",
  "Panadería",
  "Suplementos",
  "Ropa y Accesorios",
  "Belleza y Cuidado",
  "Servicios",
  "Fitness y Bienestar",
  "Educación",
  "Otro",
];

interface BusinessFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateBusinessData>;
  onSuccess?: () => void;
}

export const BusinessForm = ({ mode, initialData, onSuccess }: BusinessFormProps) => {
  const router = useRouter();
  const { createBusiness, loading } = useBusinessMutations();

  const [formData, setFormData] = useState<CreateBusinessData>({
    namePlace: initialData?.namePlace || "",
    address: initialData?.address || "",
    location: initialData?.location || undefined,
    image: initialData?.image || "",
    contact: initialData?.contact || [{ phone: "", email: "", website: "" }],
    budget: initialData?.budget || 0,
    typeBusiness: initialData?.typeBusiness || "",
    hours: initialData?.hours || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namePlace.trim()) {
      newErrors.namePlace = "El nombre del negocio es requerido";
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!formData.typeBusiness) {
      newErrors.typeBusiness = "El tipo de negocio es requerido";
    }

    if (!formData.image.trim()) {
      newErrors.image = "La imagen es requerida";
    }

    if (formData.budget < 0) {
      newErrors.budget = "El presupuesto debe ser un número positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    try {
      if (mode === "create") {
        const newBusiness = await createBusiness(formData);
        toast.success("Negocio creado exitosamente");
        router.push(`/businesses/${newBusiness._id}`);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        mode === "create" ? "Error al crear el negocio" : "Error al actualizar el negocio"
      );
    }
  };

  const handleInputChange = (
    field: keyof CreateBusinessData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleContactChange = (field: "phone" | "email" | "website", value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: [{ ...prev.contact[0], [field]: value }],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6" noValidate>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" aria-hidden="true" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-namePlace">
              Nombre del Negocio{" "}
              <span aria-label="requerido" className="text-red-600">
                *
              </span>
            </Label>
            <Input
              id="business-namePlace"
              type="text"
              placeholder="Ej: Verde Market"
              value={formData.namePlace}
              onChange={(e) => handleInputChange("namePlace", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.namePlace}
              aria-describedby={errors.namePlace ? "business-namePlace-error" : undefined}
              className={errors.namePlace ? "border-red-500" : ""}
            />
            {errors.namePlace && (
              <p id="business-namePlace-error" role="alert" className="text-sm text-red-600">
                {errors.namePlace}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-address">
              Dirección{" "}
              <span aria-label="requerido" className="text-red-600">
                *
              </span>
            </Label>
            <Input
              id="business-address"
              type="text"
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "business-address-error" : undefined}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p id="business-address-error" role="alert" className="text-sm text-red-600">
                {errors.address}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-typeBusiness">
              Tipo de Negocio{" "}
              <span aria-label="requerido" className="text-red-600">
                *
              </span>
            </Label>
            <Select
              value={formData.typeBusiness}
              onValueChange={(value) => handleInputChange("typeBusiness", value)}
            >
              <SelectTrigger
                id="business-typeBusiness"
                aria-required="true"
                aria-invalid={!!errors.typeBusiness}
                aria-describedby={errors.typeBusiness ? "business-typeBusiness-error" : undefined}
                className={errors.typeBusiness ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona el tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeBusiness && (
              <p id="business-typeBusiness-error" role="alert" className="text-sm text-red-600">
                {errors.typeBusiness}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-budget">Presupuesto Promedio (USD)</Label>
            <Input
              id="business-budget"
              type="number"
              min="0"
              placeholder="Ej: 25"
              value={formData.budget || ""}
              onChange={(e) => handleInputChange("budget", Number(e.target.value) || 0)}
              aria-invalid={!!errors.budget}
              aria-describedby={errors.budget ? "business-budget-error" : undefined}
              className={errors.budget ? "border-red-500" : ""}
            />
            {errors.budget && (
              <p id="business-budget-error" role="alert" className="text-sm text-red-600">
                {errors.budget}
              </p>
            )}
            <p id="business-budget-hint" className="text-sm text-gray-500">
              Presupuesto promedio por visita (opcional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
            Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-image">
              URL de la Imagen{" "}
              <span aria-label="requerido" className="text-red-600">
                *
              </span>
            </Label>
            <Input
              id="business-image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.image}
              aria-describedby={errors.image ? "business-image-error" : undefined}
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && (
              <p id="business-image-error" role="alert" className="text-sm text-red-600">
                {errors.image}
              </p>
            )}
          </div>

          {formData.image && (
            <div className="mt-4">
              <Label>Vista Previa</Label>
              <div className="relative mt-2 h-48 overflow-hidden rounded-lg border">
                <Image
                  src={formData.image}
                  alt="Vista previa de la imagen del negocio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-business.jpg";
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Teléfono
            </Label>
            <Input
              id="business-phone"
              type="tel"
              placeholder="Ej: +57 301 234 5678"
              value={formData.contact[0]?.phone || ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-contact-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </Label>
            <Input
              id="business-contact-email"
              type="email"
              placeholder="Ej: contacto@negocio.com"
              value={formData.contact[0]?.email || ""}
              onChange={(e) => handleContactChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" aria-hidden="true" />
              Sitio Web
            </Label>
            <Input
              id="business-website"
              type="url"
              placeholder="Ej: https://www.negocio.com"
              value={formData.contact[0]?.website || ""}
              onChange={(e) => handleContactChange("website", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            <div className="flex items-center gap-2">
              <div
                role="status"
                aria-label={mode === "create" ? "Creando negocio..." : "Actualizando negocio..."}
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              >
                <span className="sr-only">
                  {mode === "create" ? "Creando..." : "Actualizando..."}
                </span>
              </div>
              {mode === "create" ? "Creando..." : "Actualizando..."}
            </div>
          ) : mode === "create" ? (
            "Crear Negocio"
          ) : (
            "Actualizar Negocio"
          )}
        </Button>
      </div>
    </form>
  );
};
