const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  const response = await fetch(
    `${API_URL}/posts?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch posts");
  }

  return response.json();
}

export async function getPost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch post");
  }

  return response.json();
}

export async function createPost(data: CreatePostData) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create post");
  }

  return response.json();
}

export async function updatePost(id: string, data: Partial<CreatePostData>) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update post");
  }

  return response.json();
}

export async function deletePost(id: string) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete post");
  }

  return response.json();
}

export async function likePost(id: string) {
  const response = await fetch(`${API_URL}/posts/like/${id}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to like post");
  }

  return response.json();
}

export async function addComment(id: string, data: CreateCommentData) {
  const response = await fetch(`${API_URL}/posts/add-comment/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add comment");
  }

  return response.json();
}

export async function deleteComment(postId: string, commentId: string) {
  const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete comment");
  }

  return response.json();
} 