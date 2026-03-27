import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, BookOpen, Quote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  source?: string;
  sourceUrl?: string;
  category: 'ia' | 'dignidad' | 'familia' | 'discernimiento';
}

const faqItems: FaqItem[] = [
  {
    id: "ia-reemplazar",
    category: "ia",
    question: "¿La IA va a reemplazar a los humanos?",
    answer: "La IA puede automatizar tareas, pero no puede reemplazar lo esencialmente humano: amar, perdonar, crear con alma, tomar decisiones morales. El Papa Francisco advirtió que 'no debemos permitir que los algoritmos decidan por nosotros'. La clave no es competir con la máquina en velocidad, sino desarrollar lo que ella jamás podrá: compasión, creatividad genuina y relación con Dios.",
    source: "Papa Francisco, Mensaje Jornada de la Paz 2024",
    sourceUrl: "https://www.vatican.va",
  },
  {
    id: "ia-alma",
    category: "ia",
    question: "¿Puede una IA tener alma o conciencia?",
    answer: "No. La inteligencia artificial procesa información pero no tiene experiencia subjetiva, libre albedrío ni relación con lo trascendente. El alma es un don divino, no un emergente de la complejidad computacional. La IA puede simular respuestas emocionales, pero no puede amar, sufrir con sentido, ni buscar a Dios. Santo Tomás enseñó que el intelecto humano trasciende la materia.",
    source: "Rome Call for AI Ethics (2020), CIC #363",
    sourceUrl: "https://www.romecall.org",
  },
  {
    id: "doomscrolling",
    category: "dignidad",
    question: "¿Por qué el doomscrolling es un problema espiritual?",
    answer: "El scroll infinito de noticias catastróficas genera ansiedad, desesperanza y parálisis — todo lo contrario a la paz que Cristo promete ('Mi paz os dejo', Jn 14:27). Los algoritmos priorizan contenido que genera miedo porque mantiene tu atención. San Pablo nos dice: 'Todo lo que es verdadero, noble, justo, puro, amable... en eso pensad' (Fil 4:8). La ascesis digital es el ayuno de nuestra era.",
    source: "Filipenses 4:8, Juan 14:27",
  },
  {
    id: "algoritmo-manipula",
    category: "ia",
    question: "¿Los algoritmos de redes sociales me manipulan?",
    answer: "Sí, están diseñados para maximizar tu tiempo en pantalla, no tu bienestar. Utilizan la dopamina (likes, notificaciones) como mecanismo de enganche. El documento 'Rome Call for AI Ethics' firmado por el Vaticano exige que la IA respete la dignidad humana y la autonomía de las personas. Tú no eres el cliente de las redes sociales, eres el producto. Recuperar tu atención es un acto de libertad.",
    source: "Rome Call for AI Ethics, Vaticano 2020",
    sourceUrl: "https://www.romecall.org",
  },
  {
    id: "hijos-pantallas",
    category: "familia",
    question: "¿Cómo protejo a mis hijos de las pantallas sin aislarlos?",
    answer: "La clave no es prohibir sino formar. Establece horarios claros (no pantallas en comidas ni antes de dormir), usa controles parentales apropiados por edad, y sobre todo: sé ejemplo. Si tú estás pegado al teléfono, ellos lo imitarán. Crea espacios 'sagrados' sin tecnología: la cena familiar, el rezo juntos, los paseos. El Catecismo nos recuerda que los padres son los primeros educadores (CIC #2223).",
    source: "Catecismo #2223, Amoris Laetitia",
  },
  {
    id: "ia-orar",
    category: "discernimiento",
    question: "¿Puedo usar IA para orar o estudiar la Biblia?",
    answer: "La IA puede ser una herramienta útil para estudiar contexto bíblico, buscar versículos o estructurar reflexiones. Pero la oración es relación personal con Dios, no procesamiento de datos. Usar ChatGPT para generar una oración no es orar; es leer texto generado. La oración requiere tu corazón, tu silencio y tu vulnerabilidad ante Dios. La tecnología puede acercarte al texto, pero solo tú puedes encontrarte con la Persona.",
    source: "CIC #2559 - La oración es elevación del alma",
  },
  {
    id: "fake-news-fe",
    category: "dignidad",
    question: "¿Cómo distinguir noticias falsas sobre la fe?",
    answer: "Aplica tres filtros: 1) ¿La fuente es confiable? (Vaticano, conferencias episcopales, medios católicos reconocidos). 2) ¿Tiene contexto o es un titular sensacionalista? 3) ¿Promueve la unidad o la división? Jesús dijo 'La verdad os hará libres' (Jn 8:32). Compartir desinformación, incluso con buena intención, es faltar a la verdad. Antes de compartir, verifica. El octavo mandamiento aplica también en WhatsApp.",
    source: "Juan 8:32, CIC #2464-2487",
  },
  {
    id: "adiccion-digital",
    category: "dignidad",
    question: "¿La adicción al teléfono es pecado?",
    answer: "En sí mismo, usar el teléfono no es pecado. Pero cuando se convierte en un ídolo que ocupa el lugar de Dios, la familia o el prójimo, se convierte en un desorden. Si no puedes dejarlo durante la Misa, si lo revisas antes de orar, si prefieres el scroll a conversar con tu cónyuge: hay un problema de prioridades. El primer mandamiento nos pide no tener otros dioses. A veces el dios moderno cabe en tu bolsillo.",
    source: "CIC #2113 - La idolatría",
  },
  {
    id: "trabajo-ia",
    category: "ia",
    question: "¿La IA me va a quitar mi trabajo?",
    answer: "La IA transformará muchos empleos, pero creará otros nuevos. La Doctrina Social de la Iglesia defiende que el trabajo es vocación y dignidad, no solo producción (Laborem Exercens). En lugar de temer, prepárate: desarrolla habilidades que la IA no puede replicar — liderazgo empático, creatividad artística, pensamiento ético, trabajo manual con amor. El que sabe usar la IA como herramienta, no será reemplazado por ella.",
    source: "Juan Pablo II, Laborem Exercens (1981)",
    sourceUrl: "https://www.vatican.va",
  },
  {
    id: "ia-relaciones",
    category: "familia",
    question: "¿Las relaciones virtuales pueden sustituir las reales?",
    answer: "No. El ser humano fue creado para la comunión presencial: 'No es bueno que el hombre esté solo' (Gn 2:18). Las relaciones digitales pueden complementar pero jamás sustituir el abrazo, la mirada, la presencia física. Los estudios muestran que el aislamiento digital aumenta la depresión. La Eucaristía misma requiere presencia real: Cristo no se hizo un archivo descargable, se hizo carne.",
    source: "Génesis 2:18, CIC #1146",
  },
  {
    id: "discernir-contenido",
    category: "discernimiento",
    question: "¿Cómo saber si un contenido digital me edifica o me destruye?",
    answer: "San Ignacio de Loyola enseñó a discernir por los frutos: lo que viene de Dios produce paz, esperanza y deseo de servir. Lo que viene del enemigo produce ansiedad, comparación y vacío. Después de consumir un contenido, pregúntate: ¿Estoy más en paz o más ansioso? ¿Quiero amar más o estoy más resentido? ¿Me acerco a Dios o me alejo? Tu estado interior es el mejor algoritmo de filtrado.",
    source: "San Ignacio, Ejercicios Espirituales, Reglas de Discernimiento",
  },
  {
    id: "etica-ia-vaticano",
    category: "discernimiento",
    question: "¿Qué dice el Vaticano sobre la inteligencia artificial?",
    answer: "El Vaticano ha sido pionero en ética de IA. En 2020 lanzó el 'Rome Call for AI Ethics' firmado por Microsoft, IBM, FAO y el Gobierno italiano. Propone 6 principios: transparencia, inclusión, responsabilidad, imparcialidad, confiabilidad y seguridad/privacidad. El Papa Francisco insiste en que la IA debe servir al bien común y respetar la dignidad de cada persona, especialmente de los más vulnerables.",
    source: "Rome Call for AI Ethics, Vaticano 2020",
    sourceUrl: "https://www.romecall.org",
  },
];

const categoryLabels: Record<string, string> = {
  ia: "Inteligencia Artificial",
  dignidad: "Dignidad Digital",
  familia: "Familia y Pantallas",
  discernimiento: "Discernimiento",
};

const categoryColors: Record<string, string> = {
  ia: "text-cyan-400 bg-cyan-400/10",
  dignidad: "text-amber-400 bg-amber-400/10",
  familia: "text-rose-400 bg-rose-400/10",
  discernimiento: "text-emerald-400 bg-emerald-400/10",
};

export function EscudoVerdad() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return faqItems.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = ['ia', 'dignidad', 'familia', 'discernimiento'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="glass-cyber rounded-2xl p-4 border-amber-400/30">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar pregunta o respuesta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === null
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? categoryColors[cat].replace('bg-', 'bg-').replace('/10', '') + ' text-slate-900'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">
        {filteredItems.length} {filteredItems.length === 1 ? 'pregunta encontrada' : 'preguntas encontradas'}
      </p>

      {/* FAQ Accordion */}
      <div className="glass-cyber rounded-2xl border-amber-400/30 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {filteredItems.map((item, index) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border-b border-amber-400/10 last:border-b-0"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <div className="flex items-start gap-4 text-left w-full">
                  <span className="font-orbitron text-amber-400 text-sm opacity-50">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryColors[item.category]}`}>
                        {categoryLabels[item.category]}
                      </span>
                    </div>
                    <span className="font-orbitron text-white text-base font-medium group-hover:text-amber-400 transition-colors">
                      {item.question}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-10 space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                  
                  {item.source && (
                    <div className="flex items-start gap-2 text-sm">
                      <Quote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400">Fuente: </span>
                        {item.sourceUrl ? (
                          <a 
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline inline-flex items-center gap-1"
                          >
                            {item.source}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-300">{item.source}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No se encontraron preguntas con esos criterios.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="text-amber-400 text-sm mt-2 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </motion.div>
  );
}
