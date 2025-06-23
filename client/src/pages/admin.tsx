import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Users, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ContactSubmission } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/contact"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact");
      return response.json();
    }
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/contact/stats"], 
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact/stats");
      return response.json();
    }
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/contact/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Submission deleted",
        description: "Contact submission has been removed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contact/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    queryClient.invalidateQueries({ queryKey: ["/api/contact/stats"] });
    toast({
      title: "Data refreshed",
      description: "Contact submissions and statistics have been updated"
    });
  };

  const submissions: ContactSubmission[] = submissionsData?.data || [];
  const stats = statsData?.data || {};

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage contact submissions and view analytics</p>
          </div>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySubmissions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weekSubmissions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthSubmissions || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Submissions</CardTitle>
            <CardDescription>
              All contact form submissions received from the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading submissions...</div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">No submissions yet</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact submissions will appear here when users fill out the form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{submission.name}</h3>
                          <Badge variant="outline">ID: {submission.id}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{submission.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}