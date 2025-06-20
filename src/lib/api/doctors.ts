const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  education: string[];
  experience: string;
  languages: string[];
  rating: number;
  numReviews: number;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  name: string;
  specialty: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  education: string[];
  experience: string;
  languages: string[];
}

export interface DoctorReview {
  rating: number;
  comment: string;
}

export async function getDoctors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.specialty) searchParams.append("specialty", params.specialty);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  const response = await fetch(
    `${API_URL}/doctors?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch doctors");
  }

  return response.json();
}

export async function getDoctor(id: string): Promise<Doctor> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch doctor");
  }
  return response.json();
}

export async function searchDoctors(query: string): Promise<Doctor[]> {
  const response = await fetch(`${API_URL}/search?q=${query}`);
  if (!response.ok) {
    throw new Error("Failed to search doctors");
  }
  return response.json();
}

export async function createDoctor(data: CreateDoctorData) {
  const response = await fetch(`${API_URL}/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create doctor");
  }

  return response.json();
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorData>) {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update doctor");
  }

  return response.json();
}

export async function deleteDoctor(id: string) {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete doctor");
  }

  return response.json();
}

export async function addDoctorReview(id: string, review: DoctorReview) {
  const response = await fetch(`${API_URL}/doctors/add-review/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add review");
  }

  return response.json();
} 