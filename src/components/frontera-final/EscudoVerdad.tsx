import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    id: "gasto-espacio",
    question: "¿Por qué gastar dinero en el espacio y no en los pobres?",
    answer: "La tecnología espacial (satélites, predicción climática, comunicaciones) salva vidas en la Tierra hoy. Los satélites meteorológicos previenen desastres naturales, los de comunicaciones conectan regiones remotas con educación y salud. Además, el espíritu humano necesita explorar para no atrofiarse. El mismo impulso que nos lleva al espacio nos impulsa a buscar a Dios.",
  },
  {
    id: "soberbia-planetas",
    question: "¿Es soberbia ir a otros planetas?",
    answer: "No si vamos como custodios, no como conquistadores. Dios dijo 'Llenad la tierra y sometedla' (Gn 1:28). El universo es su regalo para ser descubierto y cuidado. La verdadera soberbia sería pensar que este vasto cosmos fue creado sin propósito o que no tenemos la responsabilidad de explorarlo con humildad y asombro.",
  },
  {
    id: "cielo-cohete",
    question: "¿Dónde queda el cielo si subimos en cohete?",
    answer: "El Cielo no es un lugar físico arriba de las nubes, es una dimensión de comunión plena con Dios. Santo Tomás de Aquino enseñó que el Cielo es un 'estado' más que un 'lugar'. Ir a Marte no te aleja ni te acerca a Dios, tu corazón sí. Un astronauta puede estar más cerca del Cielo en órbita que un incrédulo en la Tierra.",
  },
  {
    id: "extraterrestres-fe",
    question: "¿Qué pasaría con nuestra fe si encontramos vida extraterrestre?",
    answer: "Nada cambiaría en lo esencial. El Padre José Gabriel Funes, ex-director del Observatorio Vaticano, dijo que creer en extraterrestres no contradice la fe. Si Dios creó vida en otros mundos, eso solo magnifica su creatividad infinita. Cristo vino a salvar a la humanidad; otras criaturas podrían tener su propia relación con el Creador.",
  },
];

export function EscudoVerdad() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-cyber rounded-2xl border-amber-400/30 overflow-hidden"
    >
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem 
            key={item.id} 
            value={item.id}
            className="border-b border-amber-400/10 last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:no-underline group">
              <div className="flex items-start gap-4 text-left">
                <span className="font-orbitron text-amber-400 text-sm opacity-50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-orbitron text-white text-lg font-medium group-hover:text-amber-400 transition-colors">
                  {item.question}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pl-10">
                <p className="text-gray-300 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}