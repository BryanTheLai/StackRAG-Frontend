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
  p_doc_quarter integer DEFAULT NULL,
  p_report_date date DEFAULT NULL
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

    -- Apply company_name filter if provided (using case-insensitive partial match via ILIKE and wildcards)
    AND (
      p_company_name IS NULL
      OR trim(p_company_name) = ''
      OR c.company_name ILIKE '%' || p_company_name || '%'
    )

    -- Apply doc_year range filter if start/end years are provided
    AND (p_doc_year_start IS NULL OR c.doc_year >= p_doc_year_start)
    AND (p_doc_year_end IS NULL OR c.doc_year <= p_doc_year_end)

    -- Apply doc_quarter filter if provided (not NULL)
    AND (p_doc_quarter IS NULL OR c.doc_quarter = p_doc_quarter)
    -- Apply report_date filter if provided (not NULL)
    AND (p_report_date IS NULL OR c.report_date = p_report_date)

  ORDER BY
    c.embedding <=> query_embedding
  LIMIT
    match_count; -- Limit the number of results as requested
END;
$$;

-- New function to get all chunks for a list of section_ids
CREATE OR REPLACE FUNCTION get_chunks_for_sections (
  p_section_ids uuid[],
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
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
  document_filename text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
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
    d.filename AS document_filename
  FROM
    chunks AS c
  JOIN
    documents AS d ON c.document_id = d.id
  WHERE
    c.user_id = p_user_id
    AND c.section_id = ANY(p_section_ids) -- Filter by the provided section_ids
  ORDER BY
    c.document_id, c.section_id, c.chunk_index; -- Ensure consistent ordering
END;
$$;