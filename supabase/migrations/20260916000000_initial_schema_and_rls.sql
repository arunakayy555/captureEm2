-- ==============================================================================
-- CHECKPOINT 4: INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. Profiles Table (User settings & preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'night' CHECK (theme IN ('night', 'light')),
  focus_duration INTEGER DEFAULT 45,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table (Creative projects & milestones)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'shelf')),
  milestones JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tasks Table (Now / Next / Later items with Eisenhower tags)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  section TEXT DEFAULT 'now' CHECK (section IN ('now', 'next', 'later')),
  deadline TEXT,
  estimated_time TEXT,
  is_right_now BOOLEAN DEFAULT false,
  importance TEXT CHECK (importance IN ('Important', 'Not Important')),
  urgency TEXT CHECK (urgency IN ('Urgent', 'Not Urgent')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 4. Focus Sessions Table (Logged calm focus timers)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  completed BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. For Fun Items Table (Playful creative activities)
CREATE TABLE IF NOT EXISTS public.for_fun_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_enjoyed TIMESTAMPTZ
);

-- 6. Body Wellness Table (Daily physical wellness metrics)
CREATE TABLE IF NOT EXISTS public.body_wellness (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  energy INTEGER DEFAULT 7 CHECK (energy BETWEEN 1 AND 10),
  sleep TEXT DEFAULT 'Good' CHECK (sleep IN ('Good', 'Okay', 'Needs care')),
  movement TEXT DEFAULT 'Planned' CHECK (movement IN ('Done', 'Planned')),
  water TEXT DEFAULT 'Good' CHECK (water IN ('Good', 'More')),
  tasks JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_wellness_date UNIQUE (user_id, date)
);

-- 7. Weekly Reviews Table (Calm weekly reflections & statistics)
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed JSONB DEFAULT '{}'::jsonb NOT NULL,
  made TEXT DEFAULT '',
  learned TEXT DEFAULT '',
  for_fun TEXT DEFAULT '',
  next_focus TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_section ON public.tasks(user_id, section);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON public.focus_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_for_fun_user_id ON public.for_fun_items(user_id);
CREATE INDEX IF NOT EXISTS idx_body_wellness_user_date ON public.body_wellness(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON public.weekly_reviews(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.for_fun_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 2. Projects Policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Tasks Policies
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Focus Sessions Policies
CREATE POLICY "Users can view own focus sessions"
  ON public.focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON public.focus_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus sessions"
  ON public.focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. For Fun Items Policies
CREATE POLICY "Users can view own fun items"
  ON public.for_fun_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fun items"
  ON public.for_fun_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fun items"
  ON public.for_fun_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fun items"
  ON public.for_fun_items FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Body Wellness Policies
CREATE POLICY "Users can view own wellness entries"
  ON public.body_wellness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness entries"
  ON public.body_wellness FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness entries"
  ON public.body_wellness FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness entries"
  ON public.body_wellness FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Weekly Reviews Policies
CREATE POLICY "Users can view own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON public.weekly_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews"
  ON public.weekly_reviews FOR DELETE
  USING (auth.uid() = user_id);
