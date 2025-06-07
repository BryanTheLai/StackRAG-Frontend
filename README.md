# frontend-ai-cfo

https://daisyui.com/store/244268/?lang=en

https://ui.aceternity.com/

Feedback: Nexus - Admin & Client Dashboard
Thank you!

Here’s your 20% discount code: UZNTC5MA
Here’s your 20% discount code: UZNTC5MA

Use it at https://daisyui.com/store/
(valid until end of November)


<Date> June 01, 2025 12:00</Date>

```chat_session.sql
-- Create a schema if you want to group your app-specific tables (optional but good practice)
-- CREATE SCHEMA IF NOT EXISTS cfo_assistant_schema;
-- SET search_path TO cfo_assistant_schema, public; -- Use this if you create a schema

-- Ensure the uuid-ossp extension is available (should be from previous setup)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Define the chat_sessions table
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT, -- Optional title for the conversation
    history JSONB NOT NULL, -- Stores the entire chat history array
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB -- For any extra unstructured info about the conversation
);

-- Add comments to table and columns for clarity
COMMENT ON TABLE public.chat_sessions IS 'Stores individual chat conversations, with the full history as JSONB.';
COMMENT ON COLUMN public.chat_sessions.id IS 'Unique identifier for the chat session.';
COMMENT ON COLUMN public.chat_sessions.user_id IS 'Owner of the chat session, references auth.users.';
COMMENT ON COLUMN public.chat_sessions.title IS 'User-friendly title for the conversation (e.g., auto-generated from first message).';
COMMENT ON COLUMN public.chat_sessions.history IS 'The complete conversation history as a JSONB array of turns.';
COMMENT ON COLUMN public.chat_sessions.created_at IS 'Timestamp of when the conversation was created.';
COMMENT ON COLUMN public.chat_sessions.updated_at IS 'Timestamp of the last update to the conversation.';
COMMENT ON COLUMN public.chat_sessions.metadata IS 'Optional JSONB field for additional conversation metadata (e.g., summary, tags).';


-- 2. Add Indexes
-- Index on user_id for efficient lookup of a user's conversations
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

-- Optional: GIN index for querying within the JSONB history.
-- This can be added later if complex JSON queries are frequent and need optimization.
-- For "shipping fast", it's okay to omit initially.
-- CREATE INDEX IF NOT EXISTS idx_chat_sessions_history_gin ON public.chat_sessions USING GIN (history);

-- 3. Row-Level Security (RLS)
-- Enable RLS on the table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own chat sessions
CREATE POLICY "Users can select their own chat sessions"
    ON public.chat_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to insert new chat sessions for themselves
CREATE POLICY "Users can insert their own chat sessions"
    ON public.chat_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own chat sessions (e.g., change title, append to history)
CREATE POLICY "Users can update their own chat sessions"
    ON public.chat_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id) -- Ensures they are updating their own record
    WITH CHECK (auth.uid() = user_id); -- Double-check on the new data

-- Allow users to delete their own chat sessions
CREATE POLICY "Users can delete their own chat sessions"
    ON public.chat_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 4. Trigger to automatically update 'updated_at' timestamp
-- Create the trigger function (if it doesn't already exist from other table setups in a compatible way)
CREATE OR REPLACE FUNCTION public.fn_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN -- Only update if something actually changed
      NEW.updated_at = now();
      RETURN NEW;
   ELSE
      RETURN OLD; -- Return OLD to prevent an infinite loop if nothing changed
   END IF;
END;
$$ LANGUAGE 'plpgsql';

COMMENT ON FUNCTION public.fn_update_updated_at_column() IS 'Generic trigger function to update the updated_at column to the current timestamp on row modification.';

-- Apply the trigger to the chat_sessions table
CREATE TRIGGER trg_chat_sessions_update_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_updated_at_column();

-- Grant USAGE on the schema to Supabase roles if you used a custom schema
-- GRANT USAGE ON SCHEMA cfo_assistant_schema TO postgres, anon, authenticated, service_role;
-- GRANT ALL ON ALL TABLES IN SCHEMA cfo_assistant_schema TO postgres, anon, authenticated, service_role;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA cfo_assistant_schema TO postgres, anon, authenticated, service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA cfo_assistant_schema TO postgres, anon, authenticated, service_role;

-- If not using a custom schema, and tables are in 'public', Supabase roles usually have necessary grants.

SELECT 'Chat sessions table setup complete.';
```

```database_setup.sql
-- Enable the pgvector extension to store and search vector embeddings
-- Requires enabling it in the Supabase UI under Database -> Extensions first
create extension if not exists "vector";

-- Enable uuid-ossp extension for uuid_generate_v4()
create extension if not exists "uuid-ossp";

-- Drop tables if they exist (useful for development/resetting)
-- In production, be very careful with dropping tables!
drop table if exists chunks cascade; -- Use cascade to drop dependent objects
drop table if exists sections cascade;
drop table if exists documents cascade;

-- Create the documents table
create table documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null, -- Link to Supabase Auth user
    filename text not null,
    storage_path text not null, -- Path in Supabase Storage
    upload_timestamp timestamp with time zone default now(),
    status text default 'processing' not null, -- e.g., 'uploaded', 'processing', 'completed', 'failed'

    -- Extracted Metadata (Dedicated Columns for Filtering)
    doc_type text not null, -- e.g., 'pdf', 'docx'
    doc_specific_type text, -- e.g., 'Balance Sheet', 'Income Statement'
    company_name text,
    report_date date,
    doc_year integer,
    doc_quarter integer, -- 1-4 or null

    -- Full Markdown Content (NEW COLUMN)
    full_markdown_content text,

    -- Extracted Metadata (JSONB for less structured/frequently filtered data)
    doc_summary text,
    metadata jsonb, -- e.g., currency, units, sent_by, sent_to, other companies mentioned

    -- Ensure user_id is indexed for fast lookups
    constraint fk_user foreign key (user_id) references auth.users(id) on delete cascade
);

-- Add indexes for performance
create index documents_user_id_idx on documents (user_id);
create index documents_type_year_quarter_idx on documents (doc_specific_type, doc_year, doc_quarter);
create index documents_report_date_idx on documents (report_date);
create index documents_company_name_idx on documents (company_name);


-- Create the sections table
create table sections (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references documents(id) on delete cascade not null, -- Link to parent document
    user_id uuid references auth.users(id) not null, -- Redundant but useful for direct RLS

    section_heading text, -- e.g., 'Revenue Analysis'
    page_numbers integer[], -- Array of page numbers covered
    content_markdown text not null, -- The full markdown content of the section
    section_index integer not null, -- Order of the section in the document

    -- Ensure user_id and document_id are indexed
    constraint fk_document foreign key (document_id) references documents(id) on delete cascade,
    constraint fk_user_section foreign key (user_id) references auth.users(id) on delete cascade -- Ensure user consistency
);

-- Add indexes
create index sections_document_id_idx on sections (document_id);
create index sections_user_id_idx on sections (user_id);


-- Create the chunks table
create table chunks (
    id uuid primary key default uuid_generate_v4(),
    section_id uuid references sections(id) on delete cascade not null, -- Link to parent section
    document_id uuid references documents(id) on delete cascade not null, -- Redundant but useful for RLS and direct queries
    user_id uuid references auth.users(id) not null, -- Redundant but crucial for RLS

    chunk_text text not null, -- The text content of the chunk
    chunk_index integer not null, -- Order within its section/document
    start_char_index integer, -- Start character index in parent section markdown
    end_char_index integer, -- End character index in parent section markdown

    -- Embedding vector (adjust vector size based on your model, e.g., 1536 for OpenAI ada-002)
    embedding vector(1536),
    embedding_model text, -- Name or identifier of the model used

    -- Copied Metadata (for Filtering & Embedding Context) - Indexed where useful
    doc_specific_type text,
    doc_year integer,
    doc_quarter integer,
    company_name text,
    report_date date,
    section_heading text, -- Copy section heading here for easier filtering/embedding context

    -- Ensure keys and relevant metadata are indexed
    constraint fk_section foreign key (section_id) references sections(id) on delete cascade,
    constraint fk_document_chunk foreign key (document_id) references documents(id) on delete cascade,
    constraint fk_user_chunk foreign key (user_id) references auth.users(id) on delete cascade -- Ensure user consistency
);

-- Add indexes
create index chunks_section_id_idx on chunks (section_id);
create index chunks_document_id_idx on chunks (document_id);
create index chunks_user_id_idx on chunks (user_id);
-- Indexes on copied metadata for filtering BEFORE vector search
create index chunks_type_year_quarter_idx on chunks (doc_specific_type, doc_year, doc_quarter);
create index chunks_report_date_idx on chunks (report_date);
create index chunks_company_name_idx on chunks (company_name);
-- Index for vector search (hnsw recommended for performance)
-- Adjust lists based on your specific needs and performance testing
create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);


-- Set up Row Level Security (RLS)
-- RLS is OFF by default; enable it on each table
alter table documents enable row level security;
alter table sections enable row level security;
alter table chunks enable row level security;

-- Policies allow users to see/manage ONLY their own data
-- Using the more granular policies suggested by Supabase AI for better control

-- Policies for documents table
create policy "User can select their own documents" on documents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "User can insert their own documents" on documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User can update their own documents" on documents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User can delete their own documents" on documents
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for sections table
create policy "User can select their own sections" on sections
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "User can insert their own sections" on sections
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User can update their own sections" on sections
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User can delete their own sections" on sections
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for chunks table
create policy "User can select their own chunks" on chunks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "User can insert their own chunks" on chunks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User can update their own chunks" on chunks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User can delete their own chunks" on chunks
  for delete
  to authenticated
  using (auth.uid() = user_id);
```

```match_chunks_function.sql
-- Supabase SQL Editor - Command 2 - Updated and Corrected

-- Create or replace a function for searching chunks by vector similarity, filtered by user_id and optional metadata
CREATE OR REPLACE FUNCTION match_chunks (
  query_embedding vector(1536), -- The embedding vector of the search query
  match_count int,               -- How many closest chunks to return
  user_id uuid,                   -- The ID of the user whose documents we are searching

  -- New Optional Metadata Filters (with default NULL)
  p_doc_specific_type text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_doc_year_start integer DEFAULT NULL,
  p_doc_year_end integer DEFAULT NULL,
  p_doc_quarter integer DEFAULT NULL
)
-- Updated RETURNS TABLE to include document_filename
RETURNS TABLE (
  id uuid,                      -- chunk.id
  chunk_text text,
  document_id uuid,
  section_id uuid,
  section_heading text,
  chunk_index integer,
  doc_specific_type text,
  doc_year integer,
  doc_quarter integer,
  company_name text,
  report_date date,
  similarity_score float,
  document_filename text        -- <<< ADDED THIS LINE
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return chunks filtered by the user_id and any provided metadata filters,
  -- ordered by cosine distance to the query_embedding (lower is closer),
  -- and calculate the similarity score.
  RETURN QUERY
  SELECT
    c.id,                       -- Alias chunks table as 'c'
    c.chunk_text,
    c.document_id,
    c.section_id,
    c.section_heading,
    c.chunk_index,
    c.doc_specific_type,
    c.doc_year,
    c.doc_quarter,
    c.company_name,
    c.report_date,
    (c.embedding <=> query_embedding) as similarity_score, -- Cosine distance operator
    d.filename AS document_filename -- <<< ADDED: Select filename from documents table aliased as 'd'
  FROM
    chunks AS c                 -- Alias chunks table
  JOIN
    documents AS d ON c.document_id = d.id -- <<< ADDED: JOIN with documents table
  WHERE
    c.user_id = match_chunks.user_id -- Filter by the user_id (required)

    -- Apply doc_specific_type filter if provided (not NULL)
    AND (p_doc_specific_type IS NULL OR c.doc_specific_type = p_doc_specific_type)

    -- Apply company_name filter if provided (not NULL and not empty)
    -- Using ILIKE for case-insensitivity and '%' for wildcard (contains)
    AND (p_company_name IS NULL OR p_company_name = '' OR c.company_name ILIKE '%' || p_company_name || '%')

    -- Apply doc_year range filter if start/end years are provided
    AND (p_doc_year_start IS NULL OR c.doc_year >= p_doc_year_start)
    AND (p_doc_year_end IS NULL OR c.doc_year <= p_doc_year_end)

    -- Apply doc_quarter filter if provided (not NULL)
    AND (p_doc_quarter IS NULL OR c.doc_quarter = p_doc_quarter)

  ORDER BY
    c.embedding <=> query_embedding
  LIMIT
    match_count; -- Limit the number of results as requested
END;
$$;
```

```storage_setup.sql
-- scripts/storage_setup.sql

-- Create the Storage bucket
-- Ensure the bucket name follows the rules: lowercase letters, numbers, dots, hyphens
-- Set public to false for a private bucket where RLS controls access
insert into storage.buckets (id, name, public)
values ('financial-pdfs', 'financial-pdfs', false)
on conflict (id) do nothing; -- Avoid error if bucket already exists


-- Set up Row Level Security (RLS) for objects in this bucket
-- RLS on storage.objects is typically enabled by default in Supabase.
-- The following line might cause a syntax error if RLS is already enabled.
-- If you encountered an error here previously, it's safe to comment it out
-- as the RLS is likely already active.
-- alter table storage.objects enable row security;


-- Drop existing policies for this bucket if they exist (useful for development/resetting)
drop policy if exists "User can view their own files in financial-pdfs" on storage.objects;
drop policy if exists "User can upload files to their own folder in financial-pdfs" on storage.objects;
drop policy if exists "User can delete their own files in financial-pdfs" on storage.objects;
drop policy if exists "User can update their own files in financial-pdfs" on storage.objects;


-- Policy 1: Allow authenticated users to view (SELECT) files ONLY if the file path starts with their user_id/
-- Uses the syntax that worked for you: (select auth.uid())::text
create policy "User can view their own files in financial-pdfs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'financial-pdfs' AND -- Apply only to this bucket
    -- Check if the first folder segment in the object name (path) matches the authenticated user's UID
    -- We assume the path structure is '{user_id}/filename' or '{user_id}/folder/filename'
    (storage.foldername(name))[1] = (select auth.uid())::text -- User's preferred syntax
  );

-- Policy 2: Allow authenticated users to upload (INSERT) files ONLY into a folder named after their user_id
-- Uses the syntax that worked for you: (select auth.uid())::text
create policy "User can upload files to their own folder in financial-pdfs"
  on storage.objects for insert
  to authenticated
  with check ( -- 'with check' applies the policy to the new row being inserted
    bucket_id = 'financial-pdfs' AND -- Apply only to this bucket
    -- Check if the first folder segment in the object name (path) matches the authenticated user's UID
    (storage.foldername(name))[1] = (select auth.uid())::text -- User's preferred syntax
  );

-- Policy 3: Allow authenticated users to delete (DELETE) files ONLY from their own folder
-- Uses the syntax that worked for you: (select auth.uid())::text
create policy "User can delete their own files in financial-pdfs"
  on storage.objects for delete
  to authenticated
  using ( -- 'using' applies the policy to the existing row being deleted
    bucket_id = 'financial-pdfs' AND -- Apply only to this bucket
    -- Check if the first folder segment in the object name (path) matches the authenticated user's UID
    (storage.foldername(name))[1] = (select auth.uid())::text -- User's preferred syntax
  );

-- Policy 4: Allow authenticated users to update (UPDATE/UPSERT) files ONLY in their own folder
-- This is needed if you use upsert=True during upload to overwrite existing files
-- Uses the syntax that worked for you: (select auth.uid())::text
create policy "User can update their own files in financial-pdfs"
  on storage.objects for update
  to authenticated
  using ( -- 'using' applies to the old row before update
    bucket_id = 'financial-pdfs' AND
    (storage.foldername(name))[1] = (select auth.uid())::text -- User's preferred syntax
  )
  with check ( -- 'with check' applies to the new row after update
    bucket_id = 'financial-pdfs' AND
    (storage.foldername(name))[1] = (select auth.uid())::text -- User's preferred syntax
  );


-- Important Note on Path Structure:
-- These policies assume that the file path you use when uploading will start with the user's UID.
-- For example, if user UID is 'e222921f-cfdc-4a05-8cf2-aea13004bcf2',
-- you must upload to a path like 'e222921f-cfdc-4a05-8cf2-aea13004bcf2/invoice.pdf'
-- or 'e222921f-cfdc-4a05-8cf2-aea13004bcf2/reports/invoice.pdf'.
-- The policy checks (storage.foldername(name))[1] which extracts the *first* segment.
```

