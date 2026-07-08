import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Es gratis?",
    a: "Sí. Todas las funciones esenciales de ElRugido son gratuitas: coach de debate, oraciones, evangelio del día, calendario de santos y novenas. Sin tarjeta de crédito para empezar.",
  },
  {
    q: "¿Es fiel a la doctrina católica?",
    a: "Sí. Nuestro contenido se fundamenta en el Catecismo de la Iglesia Católica, documentos del Concilio Vaticano II, encíclicas papales y la Sagrada Escritura. Cada respuesta del coach está diseñada para ser doctrinalmente sólida y es revisada por nuestro asesor teológico.",
  },
  {
    q: "¿Quién está detrás de ElRugido?",
    a: "Un equipo pequeño de católicos comprometidos —desarrolladores y colaboradores teológicos— que en 2025 lanzó ElRugido para hacer la formación en apologética accesible desde el celular. No sustituimos la guía de un sacerdote ni la vida sacramental.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Podés dejar de usar la app o cerrar tu cuenta en cualquier momento desde tu perfil. Si más adelante añadimos funciones premium, la suscripción también será cancelable con un clic, sin permanencia.",
  },
  {
    q: "¿Funciona en el celular?",
    a: "Sí. ElRugido está diseñada mobile-first y funciona como Progressive Web App (PWA): podés instalarla en el celular como una app nativa, con notificaciones y modo offline para el contenido descargado.",
  },
];

export const FAQAccordionSection = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="py-20 px-4 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-secondary font-semibold text-xs uppercase tracking-wider">
            Preguntas frecuentes
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-3">
            Lo que la gente pregunta antes de empezar.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-4 md:px-5"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline hover:text-secondary py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
