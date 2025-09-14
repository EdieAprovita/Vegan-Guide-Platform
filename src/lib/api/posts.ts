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
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateCommentData {
  content: string;
}

export async function getPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  author?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.tags) searchParams.append("tags", params.tags);
  if (params?.author) searchParams.append("author", params.author);

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
