"use client";

import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () =>
    import("@/components/admin/admin-dashboard").then((mod) => ({
      default: mod.AdminDashboard,
    })),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
      </div>
    ),
    ssr: false,
  }
);

export { AdminDashboard };
