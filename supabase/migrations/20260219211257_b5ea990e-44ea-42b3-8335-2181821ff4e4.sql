
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding extensions.vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5,
  filter_source text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  source text,
  reference text,
  title text,
  content text,
  similarity double precision
)
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;
