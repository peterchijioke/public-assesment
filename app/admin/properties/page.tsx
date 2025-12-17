import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, propertyTypeToSlug } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

interface Property {
  id: string;
  property_type: string;
  name?: string;
  address: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  state: { id: string; name: string };
  region: { id: string; name: string };
  owner: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
  };
}

const AdminProperties = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [totalProperties, setTotalProperties] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filterActive !== 'all') params.append('is_active', filterActive);
        if (filterVerified !== 'all') params.append('is_verified', filterVerified);
        params.append('page', currentPage.toString());

        const response = await api.browseProperties(params.toString());
        setProperties(response.results || []);
        setTotalProperties(response.count || 0);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated, filterActive, filterVerified, currentPage]);

  const handleTogglePropertyActive = async (property: Property) => {
    try {
      await api.togglePropertyActive(property.id, !property.is_active);
      toast.success(`Property ${property.is_active ? 'deactivated' : 'activated'} successfully`);
      // Refresh properties
      const params = new URLSearchParams();
      if (filterActive !== 'all') params.append('is_active', filterActive);
      if (filterVerified !== 'all') params.append('is_verified', filterVerified);
      params.append('page', currentPage.toString());
      const response = await api.browseProperties(params.toString());
      setProperties(response.results || []);
    } catch (error) {
      console.error('Failed to toggle property active:', error);
      toast.error('Failed to update property status');
    }
  };

  const handleTogglePropertyVerified = async (property: Property) => {
    try {
      await api.togglePropertyVerified(property.id, !property.is_verified);
      toast.success(`Property ${property.is_verified ? 'unverified' : 'verified'} successfully`);
      // Refresh properties
      const params = new URLSearchParams();
      if (filterActive !== 'all') params.append('is_active', filterActive);
      if (filterVerified !== 'all') params.append('is_verified', filterVerified);
      params.append('page', currentPage.toString());
      const response = await api.browseProperties(params.toString());
      setProperties(response.results || []);
    } catch (error) {
      console.error('Failed to toggle property verified:', error);
      toast.error('Failed to update property verification status');
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    try {
      const slug = propertyTypeToSlug(property.property_type);
      await api.deleteProperty(slug, property.id);
      toast.success('Property deleted successfully');
      // Refresh properties
      const params = new URLSearchParams();
      if (filterActive !== 'all') params.append('is_active', filterActive);
      if (filterVerified !== 'all') params.append('is_verified', filterVerified);
      params.append('page', currentPage.toString());
      const response = await api.browseProperties(params.toString());
      setProperties(response.results || []);
      setTotalProperties(response.count || 0);
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Property Management</h1>
              <p className="text-muted-foreground">View and manage all properties</p>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              View Dashboard
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Active Status</label>
                  <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="true">Active Only</SelectItem>
                      <SelectItem value="false">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Verification Status</label>
                  <Select value={filterVerified} onValueChange={setFilterVerified}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="true">Verified Only</SelectItem>
                      <SelectItem value="false">Unverified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Properties ({totalProperties})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No properties found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.name || 'Unnamed'}</div>
                            <div className="text-sm text-muted-foreground">{property.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.property_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.owner.first_name} {property.owner.last_name}</div>
                            <div className="text-sm text-muted-foreground">@{property.owner.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{property.region.name}</div>
                            <div className="text-muted-foreground">{property.state.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={property.is_active ? 'default' : 'secondary'}>
                              {property.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {property.is_verified && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePropertyActive(property)}
                            >
                              {property.is_active ? (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePropertyVerified(property)}
                            >
                              {property.is_verified ? (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-1" />
                                  Unverify
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-1" />
                                  Verify
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this property? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProperty(property)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminProperties;
