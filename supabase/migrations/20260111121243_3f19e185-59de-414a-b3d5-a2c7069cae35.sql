-- Corregir Security Definer View cambiándola a SECURITY INVOKER
DROP VIEW IF EXISTS public.referral_leaderboard;

CREATE VIEW public.referral_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.nombre,
  p.avatar_url,
  COALESCE(p.referral_points, 0) as referral_points,
  COUNT(r.id) as total_referrals,
  RANK() OVER (ORDER BY COALESCE(p.referral_points, 0) DESC, COUNT(r.id) DESC) as rank
FROM public.profiles p
LEFT JOIN public.referrals r ON r.referrer_id = p.id
GROUP BY p.id, p.nombre, p.avatar_url, p.referral_points
HAVING COUNT(r.id) > 0 OR COALESCE(p.referral_points, 0) > 0
ORDER BY referral_points DESC, total_referrals DESC
LIMIT 100;