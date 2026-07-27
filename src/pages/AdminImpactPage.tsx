import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../lib/api";
import { ArrowUpRight, Users, Trophy, CheckCircle2, Clock3 } from "lucide-react";

export default function AdminImpactPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAdminImpact();
        setSummary(data.summary);
        setRows(data.users || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topUsers = useMemo(() => [...rows].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5), [rows]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Impact Dashboard</h1>
            <p className="text-text-secondary">See user-level impact, points, and verification status in one place.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-primary"><Users size={20} /> <span className="font-bold">Users</span></div>
            <div className="text-3xl font-bold mt-3">{summary?.totalUsers ?? 0}</div>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-green-600"><CheckCircle2 size={20} /> <span className="font-bold">Verified</span></div>
            <div className="text-3xl font-bold mt-3">{summary?.verifiedCompletions ?? 0}</div>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-orange-600"><Clock3 size={20} /> <span className="font-bold">Pending</span></div>
            <div className="text-3xl font-bold mt-3">{summary?.pendingCompletions ?? 0}</div>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-accent"><Trophy size={20} /> <span className="font-bold">Total Completions</span></div>
            <div className="text-3xl font-bold mt-3">{summary?.totalCompletions ?? 0}</div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Top Impact Contributors</h2>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.uid} className="flex items-center justify-between rounded-2xl border border-primary/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">#{index + 1}</div>
                  <div>
                    <div className="font-semibold">{user.name || user.uid}</div>
                    <div className="text-sm text-text-secondary">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{user.totalPoints} pts</div>
                  <div className="text-sm text-text-secondary">{user.challengesCompleted} submissions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">User Impact Table</h2>
          <table className="w-full text-left min-w-[900px]">
            <thead className="text-xs uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="py-3">User</th>
                <th className="py-3">Role</th>
                <th className="py-3">Points</th>
                <th className="py-3">Verified</th>
                <th className="py-3">Pending</th>
                <th className="py-3">Completed</th>
                <th className="py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.uid} className="border-t border-primary/10">
                  <td className="py-3"><div className="font-semibold">{user.name || user.uid}</div><div className="text-sm text-text-secondary">{user.email}</div></td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.totalPoints}</td>
                  <td className="py-3">{user.verifiedSubmissions}</td>
                  <td className="py-3">{user.pendingSubmissions}</td>
                  <td className="py-3">{user.challengesCompleted}</td>
                  <td className="py-3">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
