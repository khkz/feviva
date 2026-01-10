import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Church, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSaintOfDay } from '@/hooks/useSaintOfDay';
import { countryFlags, countryNames, monthNames } from '@/lib/countryMappings';

export function SaintOfDayLanding() {
  const { saint, allSaintsToday, loading } = useSaintOfDay();
  const today = new Date();

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  if (!saint) return null;

  const formattedDate = `${today.getDate()} de ${monthNames[today.getMonth()]}`;

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4 gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Santo del Día
          </h2>
          <p className="text-muted-foreground">
            Celebramos hoy la memoria de {allSaintsToday.length > 1 ? `${allSaintsToday.length} santos` : 'un santo'} en el calendario litúrgico
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to={`/santo/${saint.slug || saint.id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-1/3 aspect-[4/5] md:aspect-auto">
                    {saint.image_url ? (
                      <img
                        src={saint.image_url}
                        alt={saint.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[250px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Church className="h-20 w-20 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {saint.country_code && (
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-sm">
                        <span className="text-lg">{countryFlags[saint.country_code]}</span>
                        <span className="font-medium">{countryNames[saint.country_code]}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Santo destacado</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
                      {saint.name}
                    </h3>
                    
                    {saint.description && (
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {saint.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                      {saint.category === 'patron_country' && (
                        <Badge variant="outline" className="border-primary/30">
                          Santo Patrono
                        </Badge>
                      )}
                      {saint.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-fit gap-2 group">
                      Conocer su historia
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Additional saints today */}
        {allSaintsToday.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            <span className="text-sm text-muted-foreground self-center">También hoy:</span>
            {allSaintsToday
              .filter((s) => s.id !== saint.id)
              .slice(0, 4)
              .map((s) => (
                <Link
                  key={s.id}
                  to={`/santo/${s.slug || s.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {s.name}
                </Link>
              ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
