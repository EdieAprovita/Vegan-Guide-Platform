export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    photo?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export type { Doctor } from "@/lib/api/doctors";

export type { Restaurant } from "@/lib/api/restaurants";

export type { Market } from "@/lib/api/markets";

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  image?: string;
  likes: string[];
  comments: {
    user: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export type { Recipe } from "@/lib/api/recipes";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "professional" | "admin";
  photo?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type { Business } from "@/lib/api/businesses";

export interface Contact {
  phone: string;
  email: string;
  facebook?: string;
  instagram?: string;
}

export interface Animal {
  _id?: string;
  name?: string;
  species?: string;
  animalName?: string;
  specie?: string;
  breed?: string;
  age?: number;
  gender?: string;
  habitat?: string;
  diet?: string[];
  image?: string;
  vaccines?: string[];
  lastVaccine?: string;
  description?: string;
  rescued?: boolean;
  rescueDate?: string;
  healthStatus?: string;
  specialNeeds?: string[];
}

export interface Sanctuary {
  _id: string;
  sanctuaryName: string;
  name?: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  typeofSanctuary: string;
  animals: Animal[];
  capacity: number;
  caretakers: string[];
  contact: Contact[];
  reviews: Review[];
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profession {
  _id: string;
  professionName: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  description: string;
  category: string;
  requirements: string[];
  skills: string[];
  education: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  reviews: Review[];
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

export interface Social {
  youtube?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Skill {
  skill: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

export interface ProfessionalProfile {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    photo?: string;
  };
  contact: Contact[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  social: Social[];
  date: string;
  reviews: Review[];
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}
