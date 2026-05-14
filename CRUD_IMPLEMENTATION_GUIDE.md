# Complete CRUD Implementation Guide

## Overview
This guide provides the complete pattern for implementing CRUD operations across all modules with:
- **List pages** with filtering, search, and pagination
- **Create/Edit pages** as full pages (not modals)
- **Delete confirmations** and mini operations in modals
- **Proper RBAC** integration
- **Activity logging**

## Files Created

### Backend Controllers (Enhanced)
✅ `RequestItemController.php` - Complete CRUD with workflow integration
✅ `TechnologyController.php` - Complete CRUD with statistics
✅ `UserController.php` - Complete CRUD with RBAC
✅ `WorkflowController.php` - Complete workflow management

### Frontend Components
✅ `src/components/ui/data-table.tsx` - Reusable data table with pagination
✅ `src/components/ui/delete-dialog.tsx` - Reusable delete confirmation modal
✅ `src/routes/requests/index.tsx` - Requests list page
✅ `src/routes/requests/create.tsx` - Request creation page

## Pattern for All Modules

### 1. Backend Controller Pattern

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\YourModel;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class YourController extends Controller
{
    /**
     * List with filtering, search, pagination
     */
    public function index(Request $request)
    {
        $query = YourModel::query()->orderByDesc('created_at');

        // Search
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Filters
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // RBAC filtering (if needed)
        $user = auth()->user();
        if ($user->isSubCityAdministrator() && $user->sub_city) {
            $query->where('office', $user->sub_city);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Create with validation and logging
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // ... other fields
        ]);

        $item = YourModel::create($data);

        ActivityLog::log('create', 'module_name', $item, null, $data);

        return response()->json([
            'message' => 'Created successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Show single item
     */
    public function show(string $id)
    {
        $item = YourModel::with('relationships')->findOrFail($id);
        return response()->json(['data' => $item]);
    }

    /**
     * Update with validation and logging
     */
    public function update(Request $request, string $id)
    {
        $item = YourModel::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            // ... other fields
        ]);

        $oldValues = $item->toArray();
        $item->update($data);

        ActivityLog::log('update', 'module_name', $item, $oldValues, $item->toArray());

        return response()->json([
            'message' => 'Updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Delete with logging
     */
    public function destroy(string $id)
    {
        $item = YourModel::findOrFail($id);

        ActivityLog::log('delete', 'module_name', $item, $item->toArray(), null);

        $item->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Statistics endpoint (optional)
     */
    public function statistics()
    {
        $total = YourModel::count();
        $active = YourModel::where('status', 'active')->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'active' => $active,
            ],
        ]);
    }
}
```

### 2. Frontend List Page Pattern

```tsx
// src/routes/module/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Can } from "@/components/rbac/Can";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/module/")({
  component: ModulePage,
});

interface Item {
  id: number;
  name: string;
  status: string;
  // ... other fields
}

function ModulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["module", search, statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage.toString());

      return await apiGet<{
        data: Item[];
        current_page: number;
        last_page: number;
      }>(`/module?${params.toString()}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiPost(`/module/${id}`, { _method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module"] });
      toast.success("Deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete");
    },
  });

  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Item,
    },
    {
      header: "Status",
      cell: (item: Item) => (
        <Badge>{item.status}</Badge>
      ),
    },
    {
      header: "Actions",
      cell: (item: Item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: `/module/${item.id}` })}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Can permission="edit_module">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ to: `/module/${item.id}/edit` })}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can permission="delete_module">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteId(item.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Name</h1>
          <p className="text-gray-600 mt-1">Description</p>
        </div>
        <Can permission="create_module">
          <Button onClick={() => navigate({ to: "/module/create" })}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Add more filters as needed */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={data?.data || []}
            columns={columns}
            isLoading={isLoading}
            pagination={
              data
                ? {
                    currentPage: data.current_page,
                    totalPages: data.last_page,
                    onPageChange: setCurrentPage,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
```

### 3. Frontend Create/Edit Page Pattern

```tsx
// src/routes/module/create.tsx or [id]/edit.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/module/create")({
  component: CreatePage,
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  // ... other fields
});

type FormData = z.infer<typeof schema>;

function CreatePage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiPost<{ data: { id: number } }>("/module", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Created successfully");
      navigate({ to: `/module/${data.id}` });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create");
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/module" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Add more fields */}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/module" })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
```

## Modules to Implement

### 1. Technology Requests ✅
- List page: ✅ Created
- Create page: ✅ Created
- Edit page: ⏳ Use same pattern as create
- View page: ⏳ Show details with workflow timeline

### 2. Technology Registry
- List page with filters (category, status, classification)
- Create/Edit pages
- View page with deployment history

### 3. Audits
- List page with filters (status, office, due date)
- Create/Edit pages
- View page with findings and corrective actions

### 4. Vendors
- List page with filters (status, score)
- Create/Edit pages
- View page with projects and SLA metrics
- Approve action (modal)

### 5. Workflows
- List page (definitions and instances)
- Create workflow definition page
- View instance with timeline
- Approval actions (modals)

### 6. Users ✅
- List page: ✅ Already implemented in UserController
- Create/Edit pages
- View page with activity logs
- Toggle active (modal)
- Reset password (modal)

### 7. Cybersecurity Issues
- List page with filters (severity, status)
- Create/Edit pages
- View page with resolution details

### 8. Surveys
- List page
- Create/Edit pages
- View page with responses
- Respond action (modal or page)

### 9. Reports
- List page
- Generate report page
- View/Export actions

### 10. Notifications
- List page
- Mark as read (modal)
- View details (modal)

## Modal vs Full Page Decision

### Use Full Pages For:
- ✅ Create operations
- ✅ Edit operations
- ✅ Complex forms with multiple sections
- ✅ Forms with file uploads
- ✅ Multi-step wizards

### Use Modals For:
- ✅ Delete confirmations
- ✅ Simple status changes (activate/deactivate)
- ✅ Quick actions (approve, reject)
- ✅ Password reset
- ✅ Mark as read
- ✅ Simple confirmations

## Next Steps

1. **Complete Request Module**
   - Edit page
   - View page with workflow timeline
   - Submit action (modal)

2. **Implement Technology Registry**
   - All CRUD pages
   - Statistics dashboard

3. **Implement Audits**
   - All CRUD pages
   - Schedule audit (modal)

4. **Implement Vendors**
   - All CRUD pages
   - Approve vendor (modal)

5. **Continue with remaining modules**

## Code Generation Script

You can use this pattern to quickly generate new CRUD pages:

```bash
# Create module structure
mkdir -p src/routes/module
touch src/routes/module/index.tsx
touch src/routes/module/create.tsx
touch src/routes/module/[id].tsx
touch src/routes/module/[id]/edit.tsx
```

## Testing Checklist

For each module:
- [ ] List page loads with data
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Create page saves data
- [ ] Edit page loads existing data
- [ ] Edit page saves changes
- [ ] Delete confirmation works
- [ ] Delete removes data
- [ ] RBAC permissions enforced
- [ ] Activity logs created
- [ ] Toast notifications show
- [ ] Error handling works

## Summary

This guide provides the complete pattern for implementing CRUD operations across all modules. The pattern ensures:
- Consistent user experience
- Proper RBAC integration
- Activity logging
- Error handling
- Responsive design
- Accessibility

Follow this pattern for all remaining modules to maintain consistency across the application.
