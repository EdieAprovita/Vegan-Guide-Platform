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
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namePlace">Nombre del Negocio *</Label>
            <Input
              id="namePlace"
              type="text"
              placeholder="Ej: Verde Market"
              value={formData.namePlace}
              onChange={(e) => handleInputChange("namePlace", e.target.value)}
              className={errors.namePlace ? "border-red-500" : ""}
            />
            {errors.namePlace && <p className="text-sm text-red-600">{errors.namePlace}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              type="text"
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeBusiness">Tipo de Negocio *</Label>
            <Select
              value={formData.typeBusiness}
              onValueChange={(value) => handleInputChange("typeBusiness", value)}
            >
              <SelectTrigger className={errors.typeBusiness ? "border-red-500" : ""}>
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
            {errors.typeBusiness && <p className="text-sm text-red-600">{errors.typeBusiness}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Presupuesto Promedio (USD)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              placeholder="Ej: 25"
              value={formData.budget || ""}
              onChange={(e) => handleInputChange("budget", Number(e.target.value) || 0)}
              className={errors.budget ? "border-red-500" : ""}
            />
            {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
            <p className="text-sm text-gray-500">Presupuesto promedio por visita (opcional)</p>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">URL de la Imagen *</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
          </div>

          {formData.image && (
            <div className="mt-4">
              <Label>Vista Previa</Label>
              <div className="mt-2 h-48 overflow-hidden rounded-lg border">
                <Image
                  src={formData.image}
                  alt="Preview"
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
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: +57 301 234 5678"
              value={formData.contact[0]?.phone || ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ej: contacto@negocio.com"
              value={formData.contact[0]?.email || ""}
              onChange={(e) => handleContactChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sitio Web
            </Label>
            <Input
              id="website"
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
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
