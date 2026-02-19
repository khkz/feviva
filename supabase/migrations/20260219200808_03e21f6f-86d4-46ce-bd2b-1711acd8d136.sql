
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create knowledge chunks table for RAG
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'catecismo', 'biblia', 'doctrina'
  reference TEXT NOT NULL, -- 'CIC #123', 'Mt 5:1-12', etc.
  title TEXT,
  content TEXT NOT NULL,
  embedding extensions.vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Anyone can read knowledge chunks (public content)
CREATE POLICY "Anyone can view knowledge chunks"
  ON public.knowledge_chunks FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage knowledge chunks"
  ON public.knowledge_chunks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for similarity search
CREATE INDEX knowledge_chunks_embedding_idx 
  ON public.knowledge_chunks 
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 100);

-- Create match_documents function for similarity search
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding extensions.vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source TEXT,
  reference TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.source,
    kc.reference,
    kc.title,
    kc.content,
    1 - (kc.embedding <=> query_embedding)::FLOAT as similarity
  FROM public.knowledge_chunks kc
  WHERE 
    (filter_source IS NULL OR kc.source = filter_source)
    AND 1 - (kc.embedding <=> query_embedding)::FLOAT > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
