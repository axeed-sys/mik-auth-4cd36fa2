
-- Create company_info table to store company details
CREATE TABLE public.company_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  rc_number TEXT,
  address TEXT,
  email TEXT,
  phone_number TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_company_info_updated_at 
  BEFORE UPDATE ON public.company_info 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create payment_receipts table to store receipt data
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES public.payments(id) NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  company_info JSONB NOT NULL,
  user_info JSONB NOT NULL,
  payment_details JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for company_info (admin only)
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read company info
CREATE POLICY "Anyone can view company info" 
  ON public.company_info 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only allow service role to insert/update company info (admin functionality)
CREATE POLICY "Service role can manage company info" 
  ON public.company_info 
  FOR ALL 
  TO service_role
  USING (true);

-- Add RLS policies for payment_receipts
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Users can view their own receipts
CREATE POLICY "Users can view their own receipts" 
  ON public.payment_receipts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_receipts.payment_id 
      AND p.user_id = auth.uid()
    )
  );

-- Service role can manage all receipts
CREATE POLICY "Service role can manage receipts" 
  ON public.payment_receipts 
  FOR ALL 
  TO service_role
  USING (true);

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true);

-- Allow public access to company assets
CREATE POLICY "Public access to company assets" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'company-assets');

-- Allow authenticated users to upload company assets
CREATE POLICY "Authenticated users can upload company assets" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'company-assets');

-- Allow authenticated users to update company assets
CREATE POLICY "Authenticated users can update company assets" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'company-assets');
