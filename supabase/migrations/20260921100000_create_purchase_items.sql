-- ==============================================================================
-- PURCHASE ITEMS TABLE & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.purchase_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'purchased', 'discarded')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  purchased_at TIMESTAMPTZ,
  discarded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user, status, and chronological lookups
CREATE INDEX IF NOT EXISTS idx_purchase_items_user_id ON public.purchase_items(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_status ON public.purchase_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_items_created_at ON public.purchase_items(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Policies for Purchase Items
DROP POLICY IF EXISTS "Users can view own purchase items" ON public.purchase_items;
CREATE POLICY "Users can view own purchase items"
  ON public.purchase_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchase items" ON public.purchase_items;
CREATE POLICY "Users can insert own purchase items"
  ON public.purchase_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own purchase items" ON public.purchase_items;
CREATE POLICY "Users can update own purchase items"
  ON public.purchase_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own purchase items" ON public.purchase_items;
CREATE POLICY "Users can delete own purchase items"
  ON public.purchase_items FOR DELETE
  USING (auth.uid() = user_id);
