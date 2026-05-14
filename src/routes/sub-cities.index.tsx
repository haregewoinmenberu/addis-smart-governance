import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubCities, activateSubCity, deactivateSubCity, deleteSubCity } from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Plus, Search, Building2, Users, CheckCircle, XCircle, Edit, Eye, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';

export const Route = createFileRoute('/sub-cities/')({
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
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'toggle' | 'delete' | null;
    target: SubCity | null;
  }>({ isOpen: false, action: null, target: null });
  const queryClient = useQueryClient();

  const { data: subCitiesData, isLoading } = useQuery({
    queryKey: ['sub-cities', search],
    queryFn: () => getSubCities(search ? { search } : undefined),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return isActive ? deactivateSubCity(id) : activateSubCity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-cities'] });
      toast.success('Sub-city status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-cities'] });
      toast.success('Sub-city deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete sub-city');
    },
  });

  const openConfirm = (action: 'toggle' | 'delete', target: SubCity) => {
    setConfirmState({ isOpen: true, action, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.target || !confirmState.action) return;
    if (confirmState.action === 'toggle') {
      toggleActiveMutation.mutate({
        id: confirmState.target.id,
        isActive: confirmState.target.is_active,
      });
    }
    if (confirmState.action === 'delete') {
      deleteMutation.mutate(confirmState.target.id);
    }
    closeConfirm();
  };

  const confirmTitle =
    confirmState.action === 'delete'
      ? 'Delete sub-city?'
      : confirmState.target?.is_active
        ? 'Deactivate sub-city?'
        : 'Activate sub-city?';

  const confirmMessage =
    confirmState.action === 'delete'
      ? 'This action cannot be undone.'
      : 'This will update the sub-city status immediately.';

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
          <Link to="/sub-cities/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Sub-City
            </Button>
          </Link>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/sub-cities/${subCity.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>

                          <PermissionGuard permission="edit_sub_cities">
                            <DropdownMenuItem asChild>
                              <Link to={`/sub-cities/${subCity.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          </PermissionGuard>

                          <PermissionGuard permission="edit_sub_cities">
                            <DropdownMenuItem onClick={() => openConfirm('toggle', subCity)}>
                              {subCity.is_active ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </PermissionGuard>

                          <PermissionGuard permission="delete_sub_cities">
                            <DropdownMenuItem
                              onClick={() => openConfirm('delete', subCity)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
        <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
                className={confirmState.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
