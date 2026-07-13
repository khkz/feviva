import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Church, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const countryFlags: Record<string, string> = {
  AR: '🇦🇷', BO: '🇧🇴', BR: '🇧🇷', CL: '🇨🇱', CO: '🇨🇴',
  CR: '🇨🇷', CU: '🇨🇺', DO: '🇩🇴', EC: '🇪🇨', SV: '🇸🇻',
  GT: '🇬🇹', HN: '🇭🇳', MX: '🇲🇽', NI: '🇳🇮', PA: '🇵🇦',
  PY: '🇵🇾', PE: '🇵🇪', PR: '🇵🇷', UY: '🇺🇾', VE: '🇻🇪',
};

const countryNames: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana', EC: 'Ecuador', SV: 'El Salvador',
  GT: 'Guatemala', HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá',
  PY: 'Paraguay', PE: 'Perú', PR: 'Puerto Rico', UY: 'Uruguay', VE: 'Venezuela',
};

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function SaintsPreviewSection() {
  // Fetch featured patron saints with images
  const { data: featuredSaints = [] } = useQuery({
    queryKey: ['featured-saints-landing'],
    queryFn: async () => {
      const { data } = await supabase
        .from('calendar_saints')
        .select('id, name, slug, image_url, feast_day, feast_month, category, country_code, description')
        .eq('category', 'patron_country')
        .is('duplicado_de', null)
        .not('image_url', 'is', null)
        .limit(6);

      return data || [];
    },
  });

  const formatDate = (month: number, day: number) => {
    return `${day} ${monthNames[month - 1]}`;
  };

  if (featuredSaints.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <Calendar className="w-3 h-3 mr-1" />
            Calendario Litúrgico
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Santos Patronos de América Latina
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre la historia, oraciones y festividades de los santos patronos de cada país latinoamericano.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {featuredSaints.map((saint, index) => (
            <motion.div
              key={saint.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/santo/${saint.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10">
                      {saint.image_url ? (
                        <img
                          src={saint.image_url}
                          alt={saint.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Church className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {saint.country_code && (
                        <div className="absolute top-2 right-2 text-2xl">
                          {countryFlags[saint.country_code]}
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{saint.name}</h3>
                        {saint.country_code && (
                          <p className="text-white/80 text-xs mt-0.5">
                            {countryNames[saint.country_code]}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/santos">
            <Button variant="outline" size="lg" className="gap-2">
              Ver todos los santos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
