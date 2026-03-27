import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Heart, Church, Cross } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const featuredTestimonials = [
  {
    quote: "Intenté seguir con los estudios, buscar trabajo… todo se me quedaba grande. Caí en un vacío muy grande. Hasta que un día, buscando a una amiga por los conventos de Murcia, Dios me encontró a mí. Pasé nueve días en la hospedería y sentí por primera vez una paz que no venía de fuera, sino de dentro. Hoy llevo 17 años como Hermana Pobre de Santa Clara. Cristo es la felicidad. Descúbrelo, que te lo digo yo, vale la pena.",
    author: "Hermana Leo",
    role: "Orden de las Hermanas Pobres de Santa Clara · Murcia, España",
    avatar: "L",
    tag: "Vida Consagrada",
  },
  {
    quote: "Viví en un espiral de fiestas, infidelidades y adicciones. Mi matrimonio estaba destruido. Pero Dios tocó primero el corazón de mi esposa Ana María, y a través de ella me llamó a mí. Hice un retiro, una confesión de vida, y todo empezó a cambiar. Hoy somos padres de 6 hijos, vivimos de la providencia de Dios y nuestra familia es un símbolo provida. Confía en Dios, incluso en los momentos más oscuros. Él tiene un plan para tu vida.",
    author: "Juan Pablo Obregón",
    role: "Actor, esposo y padre de 6 hijos · Colombia",
    avatar: "JP",
    tag: "Conversión",
  },
  {
    quote: "Mi hijo Quique se ahogó en la piscina con dos años. Mi mujer estuvo llorando un año. Fue una experiencia terrible. Pero como dice San Pablo: 'Omnia in bonum' — todo es para bien. No hay palabras, pero sí hay presencia. Estar al lado, coger la mano, repetir juntos el Salmo 24: 'Señor, enséñame tus caminos, instrúyeme en tus sendas.' Me quedo con dos sentencias: 'Omnia in bonum' y 'Omnia tecum' — Señor, contigo todo.",
    author: "Dr. Enrique Rojas",
    role: "Psiquiatra · Director del Instituto Rojas Estapé · Madrid",
    avatar: "ER",
    tag: "Esperanza en el dolor",
  },
  {
    quote: "Con 22 años descubrí que Dios me quería como misionero claretiano. Tardé seis años en dar el paso. Tenía tres cadenas: mi sueño de emprender, formar una familia y el miedo a decírselo a mis padres. Dios las fue rompiendo una a una. El día que puse el primer pie en la casa de formación sentí algo imborrable: volver a casa. Aquí estamos, confirmando el sí cada día. Usque ad Mortem.",
    author: "Padre José Enrique",
    role: "Misionero Claretiano",
    avatar: "JE",
    tag: "Vocación",
  },
  {
    quote: "Crecí en una familia que se consideraba católica pero no practicante. Mi padrastro, socialista, se mofaba de la religión. A los 12 años me cambié a Ética. Pero mi abuela Beba rezaba el rosario cada día por nosotros. Un día, en una librería, una luz caía sobre una Biblia didáctica con una palmera en la portada — Tamara significa palmera en hebreo. La compré y esa noche empecé a leerla. Descubrí el amor de Jesús a través de la Virgen, me confesé, me confirmé, y aquí estoy.",
    author: "Tamara Falcó",
    role: "Diseñadora de moda y comunicadora · Madrid",
    avatar: "TF",
    tag: "Conversión",
  },
];

export const FeaturedTestimonials = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? featuredTestimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === featuredTestimonials.length - 1 ? 0 : c + 1));

  const t = featuredTestimonials[current];

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Cross className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Historias de Fe</h2>
        <Badge variant="secondary" className="ml-auto text-xs">
          {current + 1} / {featuredTestimonials.length}
        </Badge>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/15">
              <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-primary">
                {t.tag}
              </Badge>

              <Quote className="w-8 h-8 text-primary/25 mb-2" />

              <p className="text-foreground italic leading-relaxed text-sm mb-4">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{t.author}</p>
                  <p className="text-muted-foreground text-xs truncate">{t.role}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 mt-4">
          <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-1.5">
            {featuredTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-primary w-4" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-full">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
