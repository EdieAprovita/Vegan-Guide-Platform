"use client";

import { useState, useEffect } from "react";
import { InteractiveMap } from "@/components/features/maps/interactive-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter } from "lucide-react";
import { getRestaurants } from "@/lib/api/restaurants";
import { getDoctors } from "@/lib/api/doctors";
import { getMarkets } from "@/lib/api/markets";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  address: string;
  type: "restaurant" | "doctor" | "market" | "business" | "sanctuary";
  rating?: number;
  coordinates: [number, number];
  phone?: string;
  website?: string;
  url: string;
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("0");

  useEffect(() => {
    loadAllLocations();
  }, []);

  const loadAllLocations = async () => {
    setLoading(true);
    try {
      const allLocations: Location[] = [];

      // Load restaurants
      try {
        const restaurants = await getRestaurants({ limit: 50 });
        const restaurantData = restaurants.restaurants || restaurants;
        restaurantData.forEach((restaurant: any) => {
          if (restaurant.location?.coordinates) {
            allLocations.push({
              id: restaurant._id,
              name: restaurant.restaurantName,
              address: restaurant.address,
              type: "restaurant" as const,
              rating: restaurant.rating,
              coordinates: restaurant.location.coordinates,
              phone: restaurant.contact?.[0]?.phone,
              website: restaurant.contact?.[0]?.website,
              url: `/restaurants/${restaurant._id}`,
            });
          }
        });
      } catch (error) {
        console.error("Error loading restaurants:", error);
      }

      // Load doctors
      try {
        const doctors = await getDoctors({ limit: 50 });
        const doctorData = doctors.doctors || doctors;
        doctorData.forEach((doctor: any) => {
          if (doctor.location?.coordinates) {
            allLocations.push({
              id: doctor._id,
              name: `Dr. ${doctor.name}`,
              address: doctor.address,
              type: "doctor" as const,
              rating: doctor.rating,
              coordinates: doctor.location.coordinates,
              phone: doctor.contact?.[0]?.phone,
              website: doctor.contact?.[0]?.website,
              url: `/doctors/${doctor._id}`,
            });
          }
        });
      } catch (error) {
        console.error("Error loading doctors:", error);
      }

      // Load markets
      try {
        const markets = await getMarkets({ limit: 50 });
        const marketData = markets.markets || markets;
        marketData.forEach((market: any) => {
          if (market.location?.coordinates) {
            allLocations.push({
              id: market._id,
              name: market.marketName,
              address: market.address,
              type: "market" as const,
              rating: market.rating,
              coordinates: market.location.coordinates,
              phone: market.contact?.[0]?.phone,
              website: market.contact?.[0]?.website,
              url: `/markets/${market._id}`,
            });
          }
        });
      } catch (error) {
        console.error("Error loading markets:", error);
      }

      setLocations(allLocations);
    } catch (error) {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = search
      ? location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.address.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesType = typeFilter === "all" || location.type === typeFilter;

    const matchesRating = ratingFilter === "0" || (location.rating && location.rating >= parseInt(ratingFilter));

    return matchesSearch && matchesType && matchesRating;
  });

  const getTypeCount = (type: string) => {
    return locations.filter((location) => location.type === type).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vegan Guide Map
          </h1>
          <p className="text-gray-600">
            Discover vegan-friendly restaurants, doctors, markets, and more in your area
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Types ({locations.length})
                  </SelectItem>
                  <SelectItem value="restaurant">
                    Restaurants ({getTypeCount("restaurant")})
                  </SelectItem>
                  <SelectItem value="doctor">
                    Doctors ({getTypeCount("doctor")})
                  </SelectItem>
                  <SelectItem value="market">
                    Markets ({getTypeCount("market")})
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="2">2+ stars</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center text-sm text-gray-600">
                {filteredLocations.length} locations found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading locations...</p>
            </CardContent>
          </Card>
        ) : (
          <InteractiveMap
            locations={filteredLocations}
            height="600px"
            showInfoWindow={true}
            onLocationClick={(location) => {
              console.log("Location clicked:", location);
            }}
          />
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getTypeCount("restaurant")}</div>
              <div className="text-sm text-gray-600">Restaurants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{getTypeCount("doctor")}</div>
              <div className="text-sm text-gray-600">Doctors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{getTypeCount("market")}</div>
              <div className="text-sm text-gray-600">Markets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{locations.length}</div>
              <div className="text-sm text-gray-600">Total Locations</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 