
-- Create router_config table
CREATE TABLE public.router_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'api' CHECK (connection_type IN ('api', 'ssh')),
  api_port INTEGER NOT NULL DEFAULT 8728,
  ssh_port INTEGER NOT NULL DEFAULT 22,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_payment_status table
CREATE TABLE public.user_payment_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.pppoe_users(id) ON DELETE CASCADE,
  plan_price NUMERIC NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  auto_block_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_router_config_updated_at
  BEFORE UPDATE ON public.router_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_payment_status_updated_at
  BEFORE UPDATE ON public.user_payment_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (optional - you can add policies later if needed)
ALTER TABLE public.router_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_status ENABLE ROW LEVEL SECURITY;

-- Create basic policies to allow access (you can make these more restrictive later)
CREATE POLICY "Allow all operations on router_config" ON public.router_config
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on user_payment_status" ON public.user_payment_status
  FOR ALL USING (true);
