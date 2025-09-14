// Phase 1 Components
export { RecipeList } from "./recipes/recipe-list";
export { RecipeCard } from "./recipes/recipe-card";
export { RecipeForm } from "./recipes/recipe-form";
export { RestaurantList } from "./restaurants/restaurant-list";
export { RestaurantCard } from "./restaurants/restaurant-card";
export { ReviewSystem } from "./reviews/review-system";
export { GlobalSearch } from "./search/global-search";
export { BusinessList } from "./businesses/business-list";
export { BusinessCard } from "./businesses/business-card";
export { BusinessForm } from "./businesses/business-form";
export { BusinessDetailClient } from "./businesses/business-detail-client";

// Phase 2 Components
// Unify doctors lists: expose SimpleDoctorList under DoctorList for consistency
export { SimpleDoctorList as DoctorList } from "./doctors/simple-doctor-list";
export { DoctorCard } from "./doctors/doctor-card";
export { MarketList } from "./markets/market-list";
export { MarketCard } from "./markets/market-card";
export { PostList } from "./posts/post-list";
export { PostCard } from "./posts/post-card";

// Phase 3 Components
export { InteractiveMap } from "./maps/interactive-map";
export { NotificationBell } from "./notifications/notification-bell";
export { NotificationCenter } from "./notifications/notification-center";

// Phase 4 Components
export { ChatSystem } from "./chat/chat-system";
export { ChatButton } from "./chat/chat-button";
export { AchievementSystem } from "./gamification/achievement-system";
export { AnalyticsDashboard } from "./analytics/analytics-dashboard";
export { RecommendationEngine } from "./recommendations/recommendation-engine";

// Admin
export { AdminDashboard } from "@/components/admin/admin-dashboard";
