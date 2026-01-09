-- Create gift invitations table
CREATE TABLE public.gift_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  personal_message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired')),
  invite_code uuid DEFAULT gen_random_uuid() UNIQUE,
  sent_at timestamp with time zone,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations"
ON public.gift_invitations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone can view invitation by code (for registration flow)
CREATE POLICY "Anyone can view invitation by code"
ON public.gift_invitations
FOR SELECT
USING (true);

-- Index for faster lookups
CREATE INDEX idx_gift_invitations_invite_code ON public.gift_invitations(invite_code);
CREATE INDEX idx_gift_invitations_status ON public.gift_invitations(status);