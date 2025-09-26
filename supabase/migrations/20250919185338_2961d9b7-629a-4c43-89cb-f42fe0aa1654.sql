-- Create scenarios table for ROI calculations
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  org_id UUID NULL,
  name TEXT NOT NULL,
  current_outreach INTEGER NOT NULL DEFAULT 0,
  booking_pct DECIMAL(5,4) NOT NULL DEFAULT 0, -- stored as decimal (e.g., 0.08 for 8%)
  close_pct DECIMAL(5,4) NOT NULL DEFAULT 0,   -- stored as decimal
  avg_customer_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  projected_outreach INTEGER NOT NULL DEFAULT 0,
  inkline_investment DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- computed fields
  current_leads INTEGER GENERATED ALWAYS AS (ROUND(current_outreach * booking_pct)) STORED,
  current_customers INTEGER GENERATED ALWAYS AS (ROUND(current_outreach * booking_pct * close_pct)) STORED,
  current_revenue DECIMAL(12,2) GENERATED ALWAYS AS (ROUND(current_outreach * booking_pct * close_pct * avg_customer_value, 2)) STORED,
  projected_leads INTEGER GENERATED ALWAYS AS (ROUND(projected_outreach * booking_pct)) STORED,
  projected_customers INTEGER GENERATED ALWAYS AS (ROUND(projected_outreach * booking_pct * close_pct)) STORED,
  projected_revenue DECIMAL(12,2) GENERATED ALWAYS AS (ROUND(projected_outreach * booking_pct * close_pct * avg_customer_value, 2)) STORED,
  increase_leads INTEGER GENERATED ALWAYS AS (ROUND(projected_outreach * booking_pct) - ROUND(current_outreach * booking_pct)) STORED,
  increase_revenue DECIMAL(12,2) GENERATED ALWAYS AS (ROUND(projected_outreach * booking_pct * close_pct * avg_customer_value, 2) - ROUND(current_outreach * booking_pct * close_pct * avg_customer_value, 2)) STORED,
  leads_needed INTEGER GENERATED ALWAYS AS (CASE WHEN close_pct > 0 AND avg_customer_value > 0 THEN CEIL(inkline_investment / (close_pct * avg_customer_value)) ELSE NULL END) STORED,
  outreach_needed INTEGER GENERATED ALWAYS AS (CASE WHEN booking_pct > 0 AND close_pct > 0 AND avg_customer_value > 0 THEN CEIL(inkline_investment / (booking_pct * close_pct * avg_customer_value)) ELSE NULL END) STORED,
  roi DECIMAL(5,4) GENERATED ALWAYS AS (CASE WHEN inkline_investment > 0 THEN (ROUND(projected_outreach * booking_pct * close_pct * avg_customer_value, 2) - ROUND(current_outreach * booking_pct * close_pct * avg_customer_value, 2) - inkline_investment) / inkline_investment ELSE NULL END) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scenarios" 
ON public.scenarios 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own scenarios" 
ON public.scenarios 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own scenarios" 
ON public.scenarios 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own scenarios" 
ON public.scenarios 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();