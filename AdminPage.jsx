import { useEffect, useState } from "react";
import api from "./api";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState({ flaggedPosts: [], reports: [] });

  useEffect(() => {
    api.get("/admin/moderation").then(({ data }) => setDashboard(data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-ink">Moderation Panel</h1>
        <p className="mt-2 text-slate-600">
          Review high-risk posts and community reports in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-xl font-semibold text-ink">Flagged Posts</h2>
          <div className="space-y-3">
            {dashboard.flaggedPosts.map((post) => (
              <div key={post._id} className="rounded-2xl bg-rose-50 p-4">
                <p className="font-semibold text-rose-700">
                  Risk: {post.riskLevel} | Reports: {post.reportCount}
                </p>
                <p className="mt-2 text-sm text-slate-700">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 text-xl font-semibold text-ink">Recent Reports</h2>
          <div className="space-y-3">
            {dashboard.reports.map((report) => (
              <div key={report._id} className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm font-semibold text-ink">{report.reason}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Reported by: {report.userId?.username || "Student"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



