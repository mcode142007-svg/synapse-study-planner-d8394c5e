
-- USERS
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now(),
  onboarding_complete boolean default false
);
grant select, insert, update, delete on public.users to authenticated;
grant all on public.users to service_role;
alter table public.users enable row level security;
create policy "users_own" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

-- PROFILES
create table public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  user_type text,
  grade integer,
  college_year integer,
  degree text,
  guardian_mode boolean default false,
  parent_contact text,
  language_preference text default 'english',
  study_buddy_mode boolean default false,
  mood_checkin_enabled boolean default false,
  voice_input_enabled boolean default false,
  peak_hours text[],
  theme_preference text default 'system',
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- GOALS
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  goal_type text,
  goal_name text,
  exam_date date,
  exam_year integer,
  priority integer,
  status text default 'active',
  triage_mode boolean default false,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.goals to authenticated;
grant all on public.goals to service_role;
alter table public.goals enable row level security;
create policy "goals_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SUBJECTS
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  subject_name text,
  current_level text,
  ai_assessed_level text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.subjects to authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;
create policy "subjects_own" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SYLLABUS
create table public.syllabus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  chapter_number integer,
  chapter_name text,
  topics text[],
  source text,
  weightage text,
  is_completed boolean default false,
  completed_at timestamptz,
  is_skipped boolean default false,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.syllabus to authenticated;
grant all on public.syllabus to service_role;
alter table public.syllabus enable row level security;
create policy "syllabus_own" on public.syllabus for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- STUDY PLAN
create table public.study_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  chapter_id uuid references public.syllabus(id) on delete cascade,
  topic text,
  scheduled_date date,
  scheduled_start_time time,
  scheduled_end_time time,
  task_type text,
  difficulty text,
  estimated_minutes integer,
  status text default 'pending',
  pomodoro_work_minutes integer,
  pomodoro_break_minutes integer,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.study_plan to authenticated;
grant all on public.study_plan to service_role;
alter table public.study_plan enable row level security;
create policy "study_plan_own" on public.study_plan for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SESSIONS
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_id uuid references public.study_plan(id) on delete set null,
  topic text,
  subject_id uuid references public.subjects(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  started_at timestamptz,
  ended_at timestamptz,
  actual_minutes integer,
  problems_attempted integer,
  problems_correct integer,
  score_percentage float,
  doubts_raised integer,
  image_doubts integer,
  difficulty_handled text,
  completion_status text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.sessions to authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "sessions_own" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DOUBTS
create table public.doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  topic text,
  subject_id uuid references public.subjects(id) on delete set null,
  doubt_text text,
  resolution_path text,
  hints_needed integer,
  image_url text,
  resolved boolean default false,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.doubts to authenticated;
grant all on public.doubts to service_role;
alter table public.doubts enable row level security;
create policy "doubts_own" on public.doubts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.syllabus(id) on delete set null,
  topic text,
  note_type text,
  content text,
  image_url text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
create policy "notes_own" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SCORES
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  score_type text,
  score_value float,
  max_value float,
  percentage float,
  topics_covered text[],
  weak_topics text[],
  date_taken date,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.scores to authenticated;
grant all on public.scores to service_role;
alter table public.scores enable row level security;
create policy "scores_own" on public.scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- READINESS
create table public.readiness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  readiness_score float,
  predicted_score_min float,
  predicted_score_max float,
  weak_subjects text[],
  weak_topics text[],
  last_updated timestamptz default now()
);
grant select, insert, update, delete on public.readiness to authenticated;
grant all on public.readiness to service_role;
alter table public.readiness enable row level security;
create policy "readiness_own" on public.readiness for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ADAPTATION LOG
create table public.adaptation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  trigger_type text,
  action_taken text,
  old_difficulty text,
  new_difficulty text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.adaptation_log to authenticated;
grant all on public.adaptation_log to service_role;
alter table public.adaptation_log enable row level security;
create policy "adaptation_log_own" on public.adaptation_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MOOD LOG
create table public.mood_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  mood text,
  week_of date,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.mood_log to authenticated;
grant all on public.mood_log to service_role;
alter table public.mood_log enable row level security;
create policy "mood_log_own" on public.mood_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- POMODORO ROOMS (shared: any authenticated user can read for joining, only host can write)
create table public.pomodoro_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique,
  host_user_id uuid references public.users(id) on delete cascade,
  work_minutes integer,
  break_minutes integer,
  phase text,
  phase_started_at timestamptz,
  members jsonb,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.pomodoro_rooms to authenticated;
grant all on public.pomodoro_rooms to service_role;
alter table public.pomodoro_rooms enable row level security;
create policy "pomodoro_rooms_select_all_auth" on public.pomodoro_rooms for select to authenticated using (true);
create policy "pomodoro_rooms_insert_host" on public.pomodoro_rooms for insert to authenticated with check (auth.uid() = host_user_id);
create policy "pomodoro_rooms_update_host" on public.pomodoro_rooms for update to authenticated using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);
create policy "pomodoro_rooms_delete_host" on public.pomodoro_rooms for delete to authenticated using (auth.uid() = host_user_id);

-- AUTO-CREATE public.users ROW ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, onboarding_complete)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
