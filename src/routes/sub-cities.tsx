import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, Building2, Users, CheckCircle, XCircle, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';

export const Route = createFileRoute('/sub-cities')({
  beforeLoad: async () => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/sub-cities",
        },
      });
    }
  },
  component: SubCitiesPage,
});

interface SubCity {
  id: number;
  name: string;
  code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  is_active: boolean;
  activated_at: string;
  subscription_tier: string;
  statistics?: {
    total_users: number;
    active_users: number;
    total_technologies: number;
    total_requests: number;
    pending_requests: number;
  };
  created_at: string;
}

function SubCitiesPage() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSubCity, setSelectedSubCity] = useState<SubCity | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: subCitiesData, isLoading } = useQuery({
    queryKey: ['sub-cities', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/sub-cities?${params.toString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await api.post('/sub-cities', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-cities'] });
      setIsCreateDialogOpen(false);
      toast.success('Sub-city registered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register sub-city');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const endpoint = isActive ? 'deactivate' : 'activate';
      return await api.post(`/sub-cities/${id}/${endpoint}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-cities'] });
      toast.success('Sub-city status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate(formData);
  };

  const handleViewDetails = (subCity: SubCity) => {
    setSelectedSubCity(subCity);
    setIsViewDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sub-Cities Management</h1>
            <p className="text-muted-foreground">
              Register and manage sub-city organizations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Sub-City
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Cities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subCitiesData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subCitiesData?.data?.filter((sc: SubCity) => sc.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subCitiesData?.data?.filter((sc: SubCity) => !sc.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subCitiesData?.data?.reduce((sum: number, sc: SubCity) => 
                sum + (sc.statistics?.total_users || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sub-cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        </div>

        {/* Table */}
        <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Technologies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : subCitiesData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No sub-cities found
                  </TableCell>
                </TableRow>
              ) : (
                subCitiesData?.data?.map((subCity: SubCity) => (
                  <TableRow key={subCity.id}>
                    <TableCell className="font-medium">{subCity.name}</TableCell>
                    <TableCell>{subCity.code}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{subCity.admin_name}</div>
                        <div className="text-muted-foreground">{subCity.admin_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{subCity.phone}</div>
                        <div className="text-muted-foreground">{subCity.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{subCity.statistics?.total_users || 0} total</div>
                        <div className="text-muted-foreground">
                          {subCity.statistics?.active_users || 0} active
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subCity.statistics?.total_technologies || 0}</TableCell>
                    <TableCell>
                      <Badge variant={subCity.is_active ? 'default' : 'secondary'}>
                        {subCity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(subCity)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: subCity.id,
                              isActive: subCity.is_active,
                            })
                          }
                        >
                          {subCity.is_active ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Sub-City</DialogTitle>
            <DialogDescription>
              Register a new sub-city organization with an administrator account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Organization Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input id="code" name="code" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" name="logo" type="file" accept="image/*" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Administrator Account</h3>
              <div className="space-y-2">
                <Label htmlFor="admin_name">Full Name *</Label>
                <Input id="admin_name" name="admin_name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email *</Label>
                  <Input id="admin_email" name="admin_email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Phone</Label>
                  <Input id="admin_phone" name="admin_phone" type="tel" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_password">Password *</Label>
                <Input
                  id="admin_password"
                  name="admin_password"
                  type="password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Registering...' : 'Register Sub-City'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sub-City Details</DialogTitle>
          </DialogHeader>
          {selectedSubCity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedSubCity.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Code</Label>
                  <p className="font-medium">{selectedSubCity.code}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedSubCity.description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedSubCity.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedSubCity.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p>{selectedSubCity.address || 'N/A'}</p>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Administrator</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>{selectedSubCity.admin_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedSubCity.admin_email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedSubCity.admin_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Users</Label>
                    <p className="text-2xl font-bold">
                      {selectedSubCity.statistics?.total_users || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Active Users</Label>
                    <p className="text-2xl font-bold">
                      {selectedSubCity.statistics?.active_users || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Technologies</Label>
                    <p className="text-2xl font-bold">
                      {selectedSubCity.statistics?.total_technologies || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Pending Requests</Label>
                    <p className="text-2xl font-bold">
                      {selectedSubCity.statistics?.pending_requests || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
