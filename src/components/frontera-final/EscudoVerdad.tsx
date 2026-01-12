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
  category: 'espacio' | 'ciencia' | 'etica' | 'teologia';
}

const faqItems: FaqItem[] = [
  {
    id: "caso-galileo",
    category: "ciencia",
    question: "¿La Iglesia no odiaba la ciencia por lo de Galileo?",
    answer: "Es un mito histórico. La Iglesia fundó las universidades y financió a Galileo. El conflicto no fue por 'hacer ciencia', sino porque Galileo enseñó su teoría como verdad absoluta sin tener pruebas físicas (que llegaron años después) y ridiculizó al Papa en sus escritos. Fue un error de personas, no de la fe. Juan Pablo II pidió perdón por el proceso en 1992, reconociendo que la fe y la ciencia se necesitan mutuamente.",
    source: "Juan Pablo II, Discurso 1992",
    sourceUrl: "https://www.vatican.va",
  },
  {
    id: "gasto-espacio",
    category: "espacio",
    question: "¿Por qué gastar dinero en el espacio y no en los pobres?",
    answer: "La tecnología espacial (satélites, predicción climática, comunicaciones) salva vidas en la Tierra hoy. Los satélites meteorológicos previenen desastres naturales, los de comunicaciones conectan regiones remotas con educación y salud. Además, el espíritu humano necesita explorar para no atrofiarse. El mismo impulso que nos lleva al espacio nos impulsa a buscar a Dios.",
    source: "Pontificio Consejo Justicia y Paz",
  },
  {
    id: "soberbia-planetas",
    category: "etica",
    question: "¿Es soberbia ir a otros planetas?",
    answer: "No si vamos como custodios, no como conquistadores. Dios dijo 'Llenad la tierra y sometedla' (Gn 1:28). El universo es su regalo para ser descubierto y cuidado. La verdadera soberbia sería pensar que este vasto cosmos fue creado sin propósito o que no tenemos la responsabilidad de explorarlo con humildad y asombro.",
    source: "Génesis 1:28, Catecismo 2415",
    sourceUrl: "https://www.vatican.va/archive/catechism_sp/p3s2c2a7_sp.html",
  },
  {
    id: "cielo-cohete",
    category: "teologia",
    question: "¿Dónde queda el cielo si subimos en cohete?",
    answer: "El Cielo no es un lugar físico arriba de las nubes, es una dimensión de comunión plena con Dios. Santo Tomás de Aquino enseñó que el Cielo es un 'estado' más que un 'lugar'. Ir a Marte no te aleja ni te acerca a Dios, tu corazón sí. Un astronauta puede estar más cerca del Cielo en órbita que un incrédulo en la Tierra.",
    source: "Santo Tomás de Aquino, Summa Theologiae",
  },
  {
    id: "extraterrestres-fe",
    category: "teologia",
    question: "¿Qué pasaría con nuestra fe si encontramos vida extraterrestre?",
    answer: "Nada cambiaría en lo esencial. El Padre José Gabriel Funes, ex-director del Observatorio Vaticano, dijo que creer en extraterrestres no contradice la fe. Si Dios creó vida en otros mundos, eso solo magnifica su creatividad infinita. Cristo vino a salvar a la humanidad; otras criaturas podrían tener su propia relación con el Creador.",
    source: "P. José Gabriel Funes, L'Osservatore Romano 2008",
    sourceUrl: "https://www.vaticanobservatory.org",
  },
  {
    id: "big-bang-dios",
    category: "ciencia",
    question: "¿El Big Bang contradice la creación divina?",
    answer: "Todo lo contrario. El sacerdote católico Georges Lemaître propuso la teoría del Big Bang, que confirma que el universo tuvo un comienzo. La ciencia explica el 'cómo', la fe explica el 'por qué'. El Big Bang es el 'Fiat Lux' que la ciencia puede observar.",
    source: "Georges Lemaître, 1927",
  },
  {
    id: "evolucion-adan",
    category: "ciencia",
    question: "¿La evolución es compatible con Adán y Eva?",
    answer: "La Iglesia acepta la evolución como teoría científica para el cuerpo, pero afirma que cada alma es creada directamente por Dios. Pío XII en 'Humani Generis' (1950) permitió investigar la evolución del cuerpo humano. La verdad revelada es que Dios creó al ser humano con alma inmortal.",
    source: "Pío XII, Humani Generis (1950)",
    sourceUrl: "https://www.vatican.va/content/pius-xii/es/encyclicals/documents/hf_p-xii_enc_12081950_humani-generis.html",
  },
  {
    id: "ia-conciencia",
    category: "etica",
    question: "¿Puede una IA tener alma o conciencia?",
    answer: "No. La inteligencia artificial procesa información pero no tiene experiencia subjetiva, libre albedrío ni relación con lo trascendente. El alma es un don divino, no un emergente de la complejidad computacional. La IA puede simular respuestas, pero no puede amar, sufrir o buscar a Dios.",
    source: "Documento 'Rome Call for AI Ethics' (2020)",
    sourceUrl: "https://www.romecall.org",
  },
  {
    id: "colonizar-etica",
    category: "etica",
    question: "¿Cómo colonizar otros planetas éticamente?",
    answer: "Laudato Si' nos enseña que somos custodios, no dueños de la creación. Colonizar implica responsabilidad: no repetir los errores del colonialismo terrestre, respetar posible vida microbiana, evitar la explotación irresponsable de recursos. Ir al espacio debe ser para el bien común de la humanidad.",
    source: "Papa Francisco, Laudato Si' (2015)",
    sourceUrl: "https://www.vatican.va/content/francesco/es/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html",
  },
  {
    id: "observatorio-vaticano",
    category: "ciencia",
    question: "¿Por qué la Iglesia tiene un observatorio astronómico?",
    answer: "El Observatorio Vaticano, fundado en 1891 por León XIII, demuestra que la Iglesia no teme a la ciencia. 35 cráteres lunares llevan nombres de jesuitas científicos. La Iglesia promueve el conocimiento porque la verdad, venga de donde venga, apunta hacia Dios.",
    source: "Observatorio Vaticano (Specola Vaticana)",
    sourceUrl: "https://www.vaticanobservatory.org",
  },
  {
    id: "vida-marte",
    category: "teologia",
    question: "¿Si hay vida en Marte, necesitaría ser evangelizada?",
    answer: "El Papa Francisco dijo que bautizaría a un extraterrestre si lo pidiera. Sin embargo, la misión evangelizadora de Cristo fue dada específicamente para la humanidad. Otras formas de vida podrían tener su propia relación con el Creador, o quizás ni siquiera necesitarían redención si no conocen el pecado.",
    source: "Papa Francisco, Homilía 12 mayo 2014",
  },
  {
    id: "multiverso",
    category: "teologia",
    question: "¿Qué dice la Iglesia sobre la teoría del multiverso?",
    answer: "La teoría del multiverso es especulativa y no demostrada. Si existieran múltiples universos, todos serían creación de Dios. La omnipotencia divina no se limita a un solo cosmos. Sin embargo, la fe no depende de teorías cosmológicas; nuestra relación con Dios trasciende cualquier modelo físico.",
    source: "Pontificia Academia de Ciencias",
  },
  {
    id: "transhumanismo",
    category: "etica",
    question: "¿Es lícito mejorar al ser humano con tecnología?",
    answer: "La Iglesia distingue entre terapia (curar enfermedades) y mejoramiento (superar límites naturales). Curar es parte de nuestra vocación de cuidar la vida. Pero pretender 'superar' la naturaleza humana con implantes o modificaciones genéticas radicales puede atentar contra la dignidad dada por Dios y crear desigualdades injustas.",
    source: "Academia Pontificia para la Vida",
    sourceUrl: "https://www.academyforlife.va",
  },
];

const categoryLabels: Record<string, string> = {
  espacio: "Exploración Espacial",
  ciencia: "Ciencia y Fe",
  etica: "Ética del Futuro",
  teologia: "Teología Cósmica",
};

const categoryColors: Record<string, string> = {
  espacio: "text-cyan-400 bg-cyan-400/10",
  ciencia: "text-amber-400 bg-amber-400/10",
  etica: "text-purple-400 bg-purple-400/10",
  teologia: "text-emerald-400 bg-emerald-400/10",
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

  const categories = ['espacio', 'ciencia', 'etica', 'teologia'];

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