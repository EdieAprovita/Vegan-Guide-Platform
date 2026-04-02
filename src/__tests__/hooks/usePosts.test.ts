/**
 * H-14: usePosts — all query hooks must forward the AbortSignal provided by
 * TanStack Query to the underlying API call.
 */

import { useQuery } from "@tanstack/react-query";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as postsApi from "@/lib/api/posts";
import {
  usePosts,
  usePost,
  useNearbyPosts,
  usePostsByTags,
  useAdvancedPostSearch,
} from "@/hooks/usePosts";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/posts", () => ({
  getPosts: jest.fn(),
  getPost: jest.fn(),
  getNearbyPosts: jest.fn(),
  getPostsByTags: jest.fn(),
  getAdvancedPosts: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  likePost: jest.fn(),
  unlikePost: jest.fn(),
  addComment: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;

const TEST_SIGNAL = new AbortController().signal;

beforeEach(() => {
  locationMock.mockReturnValue({
    userCoords: { lat: 10, lng: 20 },
    getCurrentPosition: jest.fn(),
  });

  (postsApi.getPosts as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (postsApi.getPost as jest.Mock).mockResolvedValue({ success: true, data: {} });
  (postsApi.getNearbyPosts as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (postsApi.getPostsByTags as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (postsApi.getAdvancedPosts as jest.Mock).mockResolvedValue({ success: true, data: [] });

  useQueryMock.mockImplementation(
    (config: { queryFn: (ctx: { signal: AbortSignal }) => unknown }) => {
      config.queryFn({ signal: TEST_SIGNAL });
      return { data: undefined };
    }
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("H-14: usePosts signal forwarding", () => {
  it("usePosts forwards signal to getPosts", () => {
    usePosts();
    expect(postsApi.getPosts).toHaveBeenCalledWith(undefined, TEST_SIGNAL);
  });

  it("usePost forwards signal to getPost", () => {
    usePost("post-1");
    expect(postsApi.getPost).toHaveBeenCalledWith("post-1", TEST_SIGNAL);
  });

  it("useNearbyPosts forwards signal to getNearbyPosts", () => {
    useNearbyPosts({ radius: 5 });
    expect(postsApi.getNearbyPosts).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 10, longitude: 20, radius: 5 }),
      TEST_SIGNAL
    );
  });

  it("usePostsByTags forwards signal to getPostsByTags", () => {
    usePostsByTags({ tags: "vegan" });
    expect(postsApi.getPostsByTags).toHaveBeenCalledWith(
      expect.objectContaining({ tags: "vegan" }),
      TEST_SIGNAL
    );
  });

  it("useAdvancedPostSearch forwards signal to getAdvancedPosts", () => {
    useAdvancedPostSearch({ search: "tofu" });
    expect(postsApi.getAdvancedPosts).toHaveBeenCalledWith(
      expect.objectContaining({ search: "tofu" }),
      TEST_SIGNAL
    );
  });
});
