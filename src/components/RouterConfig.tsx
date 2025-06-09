import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Router, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RouterConfig {
  id: string;
  name: string;
  ip_address: string;
  username: string;
  password: string;
  connection_type: 'api' | 'ssh';
  api_port: number;
  ssh_port: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const RouterConfig = () => {
  const [isAddingRouter, setIsAddingRouter] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    username: '',
    password: '',
    connection_type: 'api' as 'api' | 'ssh',
    api_port: 8728,
    ssh_port: 22,
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routers, isLoading } = useQuery({
    queryKey: ['router-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('router_config' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RouterConfig[];
    }
  });

  const addRouterMutation = useMutation({
    mutationFn: async (newRouter: Omit<RouterConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('router_config' as any)
        .insert([newRouter])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['router-configs'] });
      setIsAddingRouter(false);
      resetForm();
      toast({
        title: "Router Added",
        description: "Router configuration has been successfully added",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add router configuration",
        variant: "destructive",
      });
    }
  });

  const updateRouterMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RouterConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('router_config' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['router-configs'] });
      setEditingRouter(null);
      resetForm();
      toast({
        title: "Router Updated",
        description: "Router configuration has been successfully updated",
      });
    }
  });

  const deleteRouterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('router_config' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['router-configs'] });
      toast({
        title: "Router Deleted",
        description: "Router configuration has been successfully deleted",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      ip_address: '',
      username: '',
      password: '',
      connection_type: 'api',
      api_port: 8728,
      ssh_port: 22,
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRouter) {
      updateRouterMutation.mutate({ id: editingRouter.id, ...formData });
    } else {
      addRouterMutation.mutate(formData);
    }
  };

  const handleEdit = (router: RouterConfig) => {
    setEditingRouter(router);
    setFormData({
      name: router.name,
      ip_address: router.ip_address,
      username: router.username,
      password: router.password,
      connection_type: router.connection_type,
      api_port: router.api_port,
      ssh_port: router.ssh_port,
      is_active: router.is_active
    });
    setIsAddingRouter(true);
  };

  const handleCancel = () => {
    setIsAddingRouter(false);
    setEditingRouter(null);
    resetForm();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading router configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Router className="h-8 w-8" />
            Router Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage router login details for automated user management
          </p>
        </div>
        <Button onClick={() => setIsAddingRouter(true)} disabled={isAddingRouter}>
          <Plus className="h-4 w-4 mr-2" />
          Add Router
        </Button>
      </div>

      {isAddingRouter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {editingRouter ? 'Edit Router Configuration' : 'Add Router Configuration'}
            </CardTitle>
            <CardDescription>
              Configure router credentials for automated user management and blocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Router Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Main Router"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Router password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <Select 
                    value={formData.connection_type} 
                    onValueChange={(value: 'api' | 'ssh') => setFormData({ ...formData, connection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API (Port 8728)</SelectItem>
                      <SelectItem value="ssh">SSH (Port 22)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.connection_type === 'api' && (
                  <div className="space-y-2">
                    <Label htmlFor="api_port">API Port</Label>
                    <Input
                      id="api_port"
                      type="number"
                      value={formData.api_port}
                      onChange={(e) => setFormData({ ...formData, api_port: parseInt(e.target.value) })}
                      placeholder="8728"
                    />
                  </div>
                )}

                {formData.connection_type === 'ssh' && (
                  <div className="space-y-2">
                    <Label htmlFor="ssh_port">SSH Port</Label>
                    <Input
                      id="ssh_port"
                      type="number"
                      value={formData.ssh_port}
                      onChange={(e) => setFormData({ ...formData, ssh_port: parseInt(e.target.value) })}
                      placeholder="22"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={addRouterMutation.isPending || updateRouterMutation.isPending}>
                  {editingRouter ? 'Update Router' : 'Add Router'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configured Routers</CardTitle>
          <CardDescription>
            List of all configured router connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {routers && routers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Connection Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routers.map((router) => (
                  <TableRow key={router.id}>
                    <TableCell className="font-medium">{router.name}</TableCell>
                    <TableCell>{router.ip_address}</TableCell>
                    <TableCell>{router.username}</TableCell>
                    <TableCell className="capitalize">
                      {router.connection_type} 
                      {router.connection_type === 'api' ? `:${router.api_port}` : `:${router.ssh_port}`}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        router.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {router.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(router)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRouterMutation.mutate(router.id)}
                          disabled={deleteRouterMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No routers configured yet. Add your first router to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RouterConfig;
