import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Code2, CheckSquare, Sparkles, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PrayerShareModal } from './PrayerShareModal';

interface ExamenItem {
  id: string;
  text: string;
  category: 'verdadero' | 'noble' | 'justo' | 'puro' | 'amable' | 'honorable';
}

// Basado en Filipenses 4:8 - "Todo lo que es verdadero, noble, justo, puro, amable, honorable"
const examenItems: ExamenItem[] = [
  { id: '1', text: '¿Lo que voy a publicar es VERDADERO? (No rumores ni fake news)', category: 'verdadero' },
  { id: '2', text: '¿Es NOBLE? (Eleva a otros en lugar de degradarlos)', category: 'noble' },
  { id: '3', text: '¿Es JUSTO? (Trata a las personas con equidad)', category: 'justo' },
  { id: '4', text: '¿Es PURO? (Libre de intenciones ocultas o dañinas)', category: 'puro' },
  { id: '5', text: '¿Es AMABLE? (Construye en lugar de destruir)', category: 'amable' },
  { id: '6', text: '¿Es HONORABLE? (Te enorgullecerías si lo viera tu familia)', category: 'honorable' },
];

const codigoDelReino = `Señor del Universo,
Tú que escribiste el ADN de la vida
y programaste las leyes de la física:

Dame sabiduría para crear tecnología 
que sirva a tu propósito.
Que mi trabajo sea luz en la red,
y que todo lo que construya
glorifique tu nombre.

"Hagan lo que hagan, trabajen de buena gana,
como para el Señor y no para los hombres."
— Colosenses 3:23

Amén.`;

export function LaboratorioVirtudes() {
  const [isExamenOpen, setIsExamenOpen] = useState(false);
  const [isOracionOpen, setIsOracionOpen] = useState(false);
  const [isPrayerShareOpen, setIsPrayerShareOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleCheck = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const resetExamen = () => {
    setCheckedItems([]);
    setIsExamenOpen(false);
  };

  const passedCount = checkedItems.length;
  const totalCount = examenItems.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400" />
          <div>
            <h2 className="font-orbitron text-2xl font-bold text-white">
              Laboratorio de Virtudes
            </h2>
            <p className="text-gray-400 text-sm">Carácter Digital</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro de Santidad Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExamenOpen(true)}
            className="glass-cyber rounded-2xl p-6 border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-400/30 transition-colors">
                <Filter className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  Filtro de Santidad
                </h3>
                <p className="text-gray-400 text-sm">
                  ¿Lo que vas a publicar glorifica a Dios o alimenta tu ego?
                </p>
                <p className="text-emerald-400/70 text-xs mt-2">
                  Basado en Filipenses 4:8
                </p>
              </div>
            </div>
          </motion.button>

          {/* Código del Reino Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOracionOpen(true)}
            className="glass-cyber rounded-2xl p-6 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/30 transition-colors">
                <Code2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Código del Reino
                </h3>
                <p className="text-gray-400 text-sm">
                  Oración para creadores y programadores.
                </p>
                <p className="text-cyan-400/70 text-xs mt-2">
                  Basado en Colosenses 3:23
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Filtro de Santidad Modal */}
      <Dialog open={isExamenOpen} onOpenChange={setIsExamenOpen}>
        <DialogContent className="glass-cyber border-emerald-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              Filtro de Santidad
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="glass-cyber rounded-xl p-4 border-amber-400/20">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Filipenses 4:8
              </p>
              <p className="text-gray-300 text-sm italic">
                "Por lo demás, hermanos, todo lo que es verdadero, todo lo honorable, 
                todo lo justo, todo lo puro, todo lo amable, todo lo digno de alabanza, 
                en esto pensad."
              </p>
            </div>
            
            <p className="text-gray-400 text-sm">
              Antes de publicar, pregúntate:
            </p>
            
            <div className="space-y-3">
              {examenItems.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    checkedItems.includes(item.id)
                      ? 'bg-emerald-400/20 border border-emerald-400/40'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Checkbox
                    checked={checkedItems.includes(item.id)}
                    onCheckedChange={() => handleCheck(item.id)}
                    className="mt-0.5"
                  />
                  <span className="text-gray-200 text-sm">{item.text}</span>
                </label>
              ))}
            </div>

            {checkedItems.length > 0 && (
              <div className="glass-cyber rounded-xl p-4 border-amber-400/20">
                <p className="text-sm text-gray-400 mb-2">Tu evaluación:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${(passedCount / totalCount) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    passedCount === totalCount ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {passedCount}/{totalCount}
                  </span>
                </div>
                {passedCount === totalCount && (
                  <p className="text-emerald-400 text-xs mt-2">
                    ✓ ¡Pasa el filtro! Adelante con tu publicación.
                  </p>
                )}
                {passedCount > 0 && passedCount < totalCount && (
                  <p className="text-amber-400 text-xs mt-2">
                    ⚠ Considera revisar los puntos que faltan antes de publicar.
                  </p>
                )}
              </div>
            )}

            <Button 
              onClick={resetExamen}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Completar Reflexión
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Código del Reino Modal */}
      <Dialog open={isOracionOpen} onOpenChange={setIsOracionOpen}>
        <DialogContent className="glass-cyber border-cyan-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              Código del Reino
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="glass-cyber rounded-xl p-6 border-amber-400/20 mb-4">
              <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {codigoDelReino}
              </pre>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p>
                Una oración para todos los que trabajan con tecnología: 
                programadores, diseñadores, creadores de contenido, y emprendedores digitales.
              </p>
            </div>

            <Button 
              onClick={() => {
                setIsOracionOpen(false);
                setIsPrayerShareOpen(true);
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir Oración
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prayer Share Modal */}
      <PrayerShareModal
        isOpen={isPrayerShareOpen}
        onClose={() => setIsPrayerShareOpen(false)}
        title="Código del Reino"
        prayer={codigoDelReino}
        saints="Oración del Creador Digital"
      />
    </>
  );
}