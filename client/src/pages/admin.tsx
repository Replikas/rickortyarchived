import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Ban, Eye, EyeOff, Trash2, UserCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin/moderator
  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'moderator'))) {
      toast({
        title: "Access Denied",
        description: "You need moderator or admin privileges to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, isLoading, toast]);

  const { data: reports = [] } = useQuery({
    queryKey: ['/api/admin/reports'],
    enabled: !!user && (user.role === 'admin' || user.role === 'moderator'),
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await apiRequest(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({ title: "User banned successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to ban user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const hideFanworkMutation = useMutation({
    mutationFn: async ({ fanworkId, reason }: { fanworkId: number; reason: string }) => {
      await apiRequest(`/api/admin/fanworks/${fanworkId}/hide`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({ title: "Content hidden successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to hide content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFanworkMutation = useMutation({
    mutationFn: async (fanworkId: number) => {
      await apiRequest(`/api/admin/fanworks/${fanworkId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: "Content deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, action }: { reportId: number; status: string; action: string }) => {
      await apiRequest(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, moderationAction: action }),
      });
    },
    onSuccess: () => {
      toast({ title: "Report updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading admin panel...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-green-400">
              Moderation Panel
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Manage reports and moderate content for the 18+ Rick and Morty fanwork archive
          </p>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-black/50 border border-green-500/30">
            <TabsTrigger value="reports" className="data-[state=active]:bg-green-500/20">
              Reports ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-green-500/20">
              Resolved Reports
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users" className="data-[state=active]:bg-green-500/20">
                User Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-black/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Pending Reports</CardTitle>
                <CardDescription className="text-gray-300">
                  Review and take action on user reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.filter(report => report.status === 'pending').map(report => (
                    <div key={report.id} className="border border-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <Badge variant="destructive">{report.reason}</Badge>
                          </div>
                          <p className="text-sm text-gray-300">{report.description}</p>
                          <p className="text-xs text-gray-400">
                            Reported: {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {report.fanworkId && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => hideFanworkMutation.mutate({
                                  fanworkId: report.fanworkId!,
                                  reason: "Hidden due to report: " + report.reason
                                })}
                                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                              >
                                <EyeOff className="w-4 h-4 mr-1" />
                                Hide Content
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteFanworkMutation.mutate(report.fanworkId!)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                          {report.userId && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => banUserMutation.mutate({
                                userId: report.userId!,
                                reason: "Banned due to report: " + report.reason
                              })}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban User
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateReportMutation.mutate({
                              reportId: report.id,
                              status: 'resolved',
                              action: 'dismissed'
                            })}
                            className="text-green-400 hover:bg-green-500/10"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reports.filter(report => report.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No pending reports
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card className="bg-black/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Resolved Reports</CardTitle>
                <CardDescription className="text-gray-300">
                  Previously handled reports and actions taken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.filter(report => report.status === 'resolved').map(report => (
                    <div key={report.id} className="border border-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{report.reason}</Badge>
                          <Badge variant="outline" className="text-green-400">
                            {report.moderationAction}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(report.reviewedAt || report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{report.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-black/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">User Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage user roles and permissions (Admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    User management interface - Coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}