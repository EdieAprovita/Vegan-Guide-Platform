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

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  photo?: string;
  bio: string;
  experience: string;
  education: string[];
  languages: string[];
  consultationFee: number;
  rating: number;
  numReviews: number;
  reviews: Review[];
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  location: {
    type: string;
    coordinates: number[];
    city: string;
    country: string;
  };
  yearsOfExperience: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website?: string;
  image?: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface Market {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website?: string;
  image?: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

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

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
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
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  averageRating: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin" | "professional";
  photo?: string;
  bio?: string;
  createdAt: string;
  isAdmin?: boolean;
} 