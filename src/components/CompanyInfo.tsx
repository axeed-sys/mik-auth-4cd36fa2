
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building, Upload, Image } from 'lucide-react';

interface CompanyInfo {
  id: string;
  company_name: string;
  rc_number: string | null;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

const CompanyInfo = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    rc_number: '',
    address: '',
    email: '',
    phone_number: '',
    logo_url: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch company info
  const { data: companyInfo, isLoading } = useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CompanyInfo | null;
    }
  });

  useEffect(() => {
    if (companyInfo) {
      setFormData({
        company_name: companyInfo.company_name || '',
        rc_number: companyInfo.rc_number || '',
        address: companyInfo.address || '',
        email: companyInfo.email || '',
        phone_number: companyInfo.phone_number || '',
        logo_url: companyInfo.logo_url || ''
      });
    }
  }, [companyInfo]);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveCompanyInfoMutation = useMutation({
    mutationFn: async (data: Partial<CompanyInfo>) => {
      let logoUrl = formData.logo_url;

      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const updateData = {
        ...data,
        logo_url: logoUrl
      };

      if (companyInfo?.id) {
        const { data: result, error } = await supabase
          .from('company_info')
          .update(updateData)
          .eq('id', companyInfo.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('company_info')
          .insert([updateData])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setLogoFile(null);
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving company info:', error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    saveCompanyInfoMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading company information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>
          Manage your company details for payment receipts and branding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rc_number">RC Number</Label>
              <Input
                id="rc_number"
                value={formData.rc_number}
                onChange={(e) => setFormData({ ...formData, rc_number: e.target.value })}
                placeholder="Enter RC number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter company email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter company address"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <img 
                    src={formData.logo_url} 
                    alt="Company logo" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      {logoFile ? logoFile.name : 'Upload Logo'}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={saveCompanyInfoMutation.isPending || uploading}
            className="w-full md:w-auto"
          >
            {saveCompanyInfoMutation.isPending || uploading ? 'Saving...' : 'Save Company Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyInfo;
