import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Settings, Database, Activity, Map, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Users", value: "1,248", change: "+12%", icon: Users },
    { title: "Active Recommendations", value: "843", change: "+5%", icon: Map },
    { title: "System Health", value: "99.9%", change: "Stable", icon: Activity },
    { title: "Dataset Updates", value: "24", change: "This week", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Control Center</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user?.name}. Manage platform settings and monitor performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Manage global platform configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
               <div>
                 <p className="font-medium text-sm text-gray-900">AI Recommendation Engine</p>
                 <p className="text-xs text-gray-500">Currently using local datasets</p>
               </div>
               <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Configure</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
               <div>
                 <p className="font-medium text-sm text-gray-900">Marketplace Verification</p>
                 <p className="text-xs text-gray-500">3 pending community requests</p>
               </div>
               <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Review</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
            <CardDescription>Actions performed by administrators</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                 { action: "Updated recommendation weights", time: "2 hours ago" },
                 { action: "Approved 'Green Campus Initiative'", time: "5 hours ago" },
                 { action: "System health check passed", time: "1 day ago" }
               ].map((log, i) => (
                 <div key={i} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <p className="text-sm text-gray-700">{log.action}</p>
                    <span className="text-xs text-gray-400">{log.time}</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
