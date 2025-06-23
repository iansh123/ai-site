import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  MessageSquare, 
  Users, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  Bell,
  BellOff,
  FolderOpen,
  User,
  Briefcase,
  LogOut,
  Settings,
  BarChart3,
  Zap,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { ContactSubmission, Client, Project, Notification } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  // Dashboard Stats Query
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/dashboard/stats", null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
      return response.json();
    }
  });

  // Contact Submissions Query
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contact"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact");
      return response.json();
    }
  });

  // Clients Query
  const { data: clientsData } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clients", null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
      return response.json();
    }
  });

  // Projects Query
  const { data: projectsData } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects", null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
      return response.json();
    }
  });

  // Notifications Query
  const { data: notificationsData } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/notifications", null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
      return response.json();
    }
  });

  // Delete Contact Mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contact/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Contact deleted",
        description: "Contact submission has been removed"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update Contact Status Mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/contact/${id}`, { status }, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Contact updated",
        description: "Contact status has been updated"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create Client Mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      await apiRequest("POST", "/api/clients", clientData, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client created",
        description: "New client has been added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating client",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create Project Mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      await apiRequest("POST", "/api/projects", projectData, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "New project has been created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mark Notification Read Mutation
  const markNotificationReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", null, {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("admin_token");
    setLocation("/admin-login");
  };

  const contacts = contactsData?.data || [];
  const clients = clientsData?.data || [];
  const projects = projectsData?.data || [];
  const notifications = notificationsData?.data || [];
  const stats = dashboardStats?.data || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500";
      case "contacted": return "bg-yellow-500";
      case "converted": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">IC AI Solutions Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Bell className="mr-2 h-4 w-4" />
                {notifications.filter((n: Notification) => !n.isRead).length} new
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="mr-2 h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContacts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.contactStats?.todaySubmissions || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {clients.filter((c: Client) => c.status === "active").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {projects.filter((p: Project) => p.status === "active").length} in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unreadNotifications || 0}</div>
                  <p className="text-xs text-muted-foreground">unread alerts</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Contacts</CardTitle>
                  <CardDescription>Latest contact form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.slice(0, 5).map((contact: ContactSubmission) => (
                      <div key={contact.id} className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-full">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                        </div>
                        <Badge className={`${getStatusColor(contact.status)} text-white`}>
                          {contact.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Current project statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project: Project) => (
                      <div key={project.id} className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-full">
                          <FolderOpen className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <p className="text-sm text-muted-foreground">${project.budget?.toLocaleString()}</p>
                        </div>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Contact Submissions</h2>
                <p className="text-muted-foreground">Manage incoming contact requests</p>
              </div>
            </div>

            <div className="grid gap-4">
              {contactsLoading ? (
                <div className="text-center py-8">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No contact submissions yet</h3>
                    <p className="text-muted-foreground">Contact submissions will appear here when received.</p>
                  </CardContent>
                </Card>
              ) : (
                contacts.map((contact: ContactSubmission) => (
                  <Card key={contact.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-full">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="mr-1 h-4 w-4" />
                                {contact.email}
                              </span>
                              {contact.phone && (
                                <span className="flex items-center">
                                  <Phone className="mr-1 h-4 w-4" />
                                  {contact.phone}
                                </span>
                              )}
                              {contact.company && (
                                <span className="flex items-center">
                                  <Building className="mr-1 h-4 w-4" />
                                  {contact.company}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(contact.status)} text-white`}>
                            {contact.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(contact.priority)} text-white`}>
                            {contact.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Message</Label>
                          <p className="text-sm text-muted-foreground mt-1">{contact.message}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                            <span>Source: {contact.source}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={contact.status}
                              onValueChange={(status) => 
                                updateContactMutation.mutate({ id: contact.id, status })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Client Management</h2>
                <p className="text-muted-foreground">Manage your business clients</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Create a new client profile</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createClientMutation.mutate({
                        name: formData.get("name"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                        company: formData.get("company"),
                        status: formData.get("status"),
                        industry: formData.get("industry")
                      });
                    }}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" name="email" type="email" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" name="phone" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">Company</Label>
                        <Input id="company" name="company" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="industry" className="text-right">Industry</Label>
                        <Input id="industry" name="industry" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue="active">
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="potential">Potential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Client</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {clients.map((client: Client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-full">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>{client.name}</CardTitle>
                          <CardDescription>{client.company} • {client.industry}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(client.status)} text-white`}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Contact Info</Label>
                        <p className="text-muted-foreground">{client.email}</p>
                        {client.phone && <p className="text-muted-foreground">{client.phone}</p>}
                      </div>
                      <div>
                        <Label>Added</Label>
                        <p className="text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Project Management</h2>
                <p className="text-muted-foreground">Track and manage client projects</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Start a new project for a client</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createProjectMutation.mutate({
                        name: formData.get("name"),
                        description: formData.get("description"),
                        clientId: parseInt(formData.get("clientId") as string),
                        budget: parseFloat(formData.get("budget") as string),
                        status: formData.get("status"),
                        startDate: formData.get("startDate"),
                        endDate: formData.get("endDate")
                      });
                    }}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-name" className="text-right">Name</Label>
                        <Input id="project-name" name="name" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-description" className="text-right">Description</Label>
                        <Textarea id="project-description" name="description" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-client" className="text-right">Client</Label>
                        <Select name="clientId" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client: Client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name} - {client.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-budget" className="text-right">Budget</Label>
                        <Input id="project-budget" name="budget" type="number" step="0.01" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-status" className="text-right">Status</Label>
                        <Select name="status" defaultValue="planning">
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-start" className="text-right">Start Date</Label>
                        <Input id="project-start" name="startDate" type="date" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project-end" className="text-right">End Date</Label>
                        <Input id="project-end" name="endDate" type="date" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Project</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {projects.map((project: Project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-full">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status}
                        </Badge>
                        {project.budget && (
                          <Badge variant="outline">
                            <DollarSign className="mr-1 h-3 w-3" />
                            {project.budget.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label>Timeline</Label>
                        <p className="text-muted-foreground">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}
                          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div>
                        <Label>Client</Label>
                        <p className="text-muted-foreground">
                          {clients.find((c: Client) => c.id === project.clientId)?.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <p className="text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground">System alerts and updates</p>
              </div>
            </div>

            <div className="grid gap-4">
              {notifications.map((notification: Notification) => (
                <Card key={notification.id} className={!notification.isRead ? "border-blue-200 bg-blue-50/50" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${!notification.isRead ? "bg-blue-100" : "bg-muted"}`}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{notification.title}</CardTitle>
                          <CardDescription>{notification.message}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={notification.type === "error" ? "destructive" : "outline"}>
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markNotificationReadMutation.mutate(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.isRead ? (
                        <span className="flex items-center">
                          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                          Read
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <AlertCircle className="mr-1 h-4 w-4 text-blue-500" />
                          Unread
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics & Reports</h2>
              <p className="text-muted-foreground">Business insights and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Contact Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contacts.length > 0 
                      ? Math.round((contacts.filter((c: ContactSubmission) => c.status === "converted").length / contacts.length) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {contacts.filter((c: ContactSubmission) => c.status === "converted").length} of {contacts.length} contacts converted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Total Project Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${projects.reduce((sum: number, p: Project) => sum + (p.budget || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Across {projects.length} projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    N8n Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Active</div>
                  <p className="text-sm text-muted-foreground">
                    Workflow automation enabled
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Contact Trends</CardTitle>
                <CardDescription>Contact submissions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                  <p>Advanced analytics charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}