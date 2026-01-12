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
    id: "ciencia-dios",
    category: "ciencia",
    question: "¿La ciencia ha matado a Dios?",
    answer: "No. La ciencia explica 'cómo' funciona el universo; la fe explica 'por qué' existe. Son complementarios, no rivales. Johannes Kepler dijo: 'Hacer ciencia es pensar los pensamientos de Dios después de Él'. Newton, Faraday, Maxwell, Mendel y muchos de los fundadores de la ciencia moderna eran creyentes devotos. La ciencia descubre las leyes de la naturaleza; la fe pregunta quién las escribió.",
    source: "Johannes Kepler, Astronomia Nova",
  },
  {
    id: "accidente-cosmico",
    category: "teologia",
    question: "¿Somos un accidente cósmico?",
    answer: "El 'Ajuste Fino' del universo es tan preciso que matemáticamente exige un Diseñador Inteligente. Si la fuerza nuclear fuerte variara un 0.5%, no existirían estrellas. Si la gravedad cambiara 1 parte en 10^60, no habría galaxias. La probabilidad de que esto ocurra por azar es matemáticamente despreciable. Como dijo Fred Hoyle (astrónomo ateo): 'Un superintelecto ha manipulado la física'.",
    source: "Fred Hoyle, The Universe: Past and Present Reflections",
  },
  {
    id: "por-que-explorar",
    category: "espacio",
    question: "¿Por qué explorar el espacio?",
    answer: "Porque fuimos hechos a imagen de un Creador infinito. Explorar su casa es un acto de adoración. 'Los cielos cuentan la gloria de Dios' (Salmo 19:1). La curiosidad científica es un regalo divino. Además, la tecnología espacial salva vidas: satélites que predicen huracanes, comunicaciones para regiones remotas, y avances médicos desarrollados en microgravedad.",
    source: "Salmo 19:1",
  },
  {
    id: "big-bang-genesis",
    category: "ciencia",
    question: "¿El Big Bang contradice Génesis?",
    answer: "Todo lo contrario. El Big Bang confirma que el universo tuvo un principio, algo que la Biblia afirmó hace milenios. 'En el principio, Dios creó los cielos y la tierra' (Génesis 1:1). Georges Lemaître, el sacerdote belga que propuso la teoría, la llamó 'el día sin ayer'. El Big Bang es el 'Fiat Lux' que la ciencia puede observar.",
    source: "Génesis 1:1; Georges Lemaître, 1927",
  },
  {
    id: "evolucion-fe",
    category: "ciencia",
    question: "¿La evolución es compatible con la fe?",
    answer: "Muchos teólogos cristianos ven la evolución como el 'cómo' de la creación, no el 'por qué'. Dios pudo usar procesos naturales para desarrollar la vida. Lo esencial es que cada ser humano es creado a imagen de Dios con alma inmortal y dignidad única. El mecanismo biológico no elimina el propósito divino.",
    source: "C.S. Lewis, The Problem of Pain",
  },
  {
    id: "ia-alma",
    category: "etica",
    question: "¿Puede una IA tener alma o conciencia?",
    answer: "No. La IA procesa información pero no tiene experiencia subjetiva, libre albedrío ni relación con lo trascendente. El alma es un don divino, no un emergente de la complejidad computacional. La IA puede simular respuestas, pero no puede amar, sufrir o buscar a Dios. 'Y Dios sopló en su nariz aliento de vida, y fue el hombre un ser viviente' (Génesis 2:7).",
    source: "Génesis 2:7",
  },
  {
    id: "extraterrestres",
    category: "teologia",
    question: "¿Y si encontramos vida extraterrestre?",
    answer: "Nada cambiaría en lo esencial. Si Dios creó vida en otros mundos, eso solo magnifica su creatividad infinita. Cristo vino específicamente a salvar a la humanidad; otras criaturas podrían tener su propia relación con el Creador, o quizás ni necesiten redención si no conocen el pecado. El universo es grande porque nuestro Dios es infinito.",
    source: "C.S. Lewis, Mera Cristiandad",
  },
  {
    id: "colonizar-etica",
    category: "etica",
    question: "¿Cómo colonizar otros planetas éticamente?",
    answer: "La Biblia nos enseña mayordomía, no dominio destructivo. 'Y tomó el Señor Dios al hombre y lo puso en el huerto del Edén, para que lo labrara y lo guardase' (Génesis 2:15). Colonizar implica responsabilidad: no repetir los errores del colonialismo terrestre, respetar posible vida microbiana, y usar recursos para el bien común de la humanidad.",
    source: "Génesis 2:15",
  },
  {
    id: "ciencia-iglesia",
    category: "ciencia",
    question: "¿Los cristianos han estado contra la ciencia?",
    answer: "Es un mito. Los cristianos fundaron las primeras universidades. Científicos como Newton, Kepler, Pasteur, Mendel, Faraday, Maxwell y Lemaître eran creyentes devotos. Newton escribió más sobre teología que física. Mendel era monje. Lemaître era sacerdote. La fe ha impulsado la ciencia, no la ha frenado.",
    source: "Rodney Stark, For the Glory of God",
  },
  {
    id: "cielo-cohete",
    category: "teologia",
    question: "¿Dónde queda el cielo si subimos en cohete?",
    answer: "El Cielo no es un lugar físico arriba de las nubes; es una dimensión de comunión plena con Dios. 'El Reino de Dios está entre vosotros' (Lucas 17:21). Ir a Marte no te aleja ni te acerca a Dios, tu corazón sí. Un astronauta puede estar más cerca del Cielo en órbita que un incrédulo en la Tierra.",
    source: "Lucas 17:21",
  },
  {
    id: "multiverso",
    category: "teologia",
    question: "¿Qué dice la Biblia sobre el multiverso?",
    answer: "La teoría del multiverso es especulativa y no demostrada. Si existieran múltiples universos, todos serían creación de Dios. 'Porque por él fueron creadas todas las cosas... todo fue creado por medio de él y para él' (Colosenses 1:16). La omnipotencia divina no se limita a un solo cosmos.",
    source: "Colosenses 1:16",
  },
  {
    id: "transhumanismo",
    category: "etica",
    question: "¿Es lícito mejorar al ser humano con tecnología?",
    answer: "Los pensadores cristianos distinguen entre terapia (curar enfermedades) y mejoramiento (superar límites naturales). Curar es parte de nuestra vocación de cuidar la vida. Pero pretender 'superar' la naturaleza humana con implantes radicales puede atentar contra la dignidad dada por Dios y crear desigualdades injustas.",
    source: "Nigel Cameron, Bioethics and Human Dignity",
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