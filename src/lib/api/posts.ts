import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from "./config";

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  tags: string[];
  likes: string[];
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      photo?: string;
    };
    content: string;
    createdAt: string;
  }[];
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  visibility: "public" | "local" | "followers";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  visibility?: "public" | "local" | "followers";
}

export interface CreateCommentData {
  content: string;
}

export interface PostSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  author?: string;
  // Geospatial parameters
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  sortBy?: "createdAt" | "distance" | "likes";
  visibility?: "public" | "local" | "followers";
}

export async function getPosts(params?: PostSearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.tags) searchParams.append("tags", params.tags);
  if (params?.author) searchParams.append("author", params.author);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.visibility) searchParams.append("visibility", params.visibility);

  return apiRequest<BackendListResponse<Post>>(`/posts?${searchParams.toString()}`);
}

export async function getPost(id: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/${id}`);
}

export async function createPost(data: CreatePostData, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updatePost(id: string, data: Partial<CreatePostData>, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/posts/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function likePost(id: string, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/like/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
  });
}

export async function unlikePost(id: string, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/unlike/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addComment(id: string, data: CreateCommentData, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/comment/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteComment(postId: string, commentId: string, token?: string) {
  return apiRequest<BackendResponse<Post>>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

// Geospatial functions following the same pattern as other sections
export async function getNearbyPosts(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  tags?: string;
  visibility?: "public" | "local" | "followers";
}) {
  const searchParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    radius: (params.radius || 5).toString(),
    sortBy: "distance",
  });

  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.tags) searchParams.append("tags", params.tags);
  if (params.visibility) searchParams.append("visibility", params.visibility);

  return apiRequest<BackendListResponse<Post>>(`/posts?${searchParams.toString()}`);
}

export async function getPostsByTags(params: {
  tags: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  sortBy?: "createdAt" | "distance" | "likes";
}) {
  const searchParams = new URLSearchParams({
    tags: params.tags,
    sortBy: params.sortBy || "createdAt",
  });

  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", (params.radius || 10).toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  return apiRequest<BackendListResponse<Post>>(`/posts?${searchParams.toString()}`);
}

export async function getAdvancedPosts(params: {
  search?: string;
  tags?: string[];
  author?: string;
  visibility?: "public" | "local" | "followers";
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "createdAt" | "distance" | "likes";
  limit?: number;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.tags && params.tags.length > 0) searchParams.append("tags", params.tags.join(","));
  if (params.author) searchParams.append("author", params.author);
  if (params.visibility) searchParams.append("visibility", params.visibility);
  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.page) searchParams.append("page", params.page.toString());

  return apiRequest<BackendListResponse<Post>>(`/posts?${searchParams.toString()}`);
}
