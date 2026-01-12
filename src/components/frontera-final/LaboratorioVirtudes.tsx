import { useState } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Code2, CheckSquare, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ExamenItem {
  id: string;
  text: string;
  category: 'crear' | 'destruir';
}

const examenItems: ExamenItem[] = [
  { id: '1', text: '¿Usé las redes sociales para animar a alguien?', category: 'crear' },
  { id: '2', text: '¿Compartí contenido que edifica o destruye?', category: 'crear' },
  { id: '3', text: '¿Dediqué tiempo excesivo a pantallas en lugar de personas?', category: 'destruir' },
  { id: '4', text: '¿Usé la tecnología para aprender algo nuevo?', category: 'crear' },
  { id: '5', text: '¿Contribuí a algún proyecto que ayuda a otros?', category: 'crear' },
  { id: '6', text: '¿Caí en la pereza digital (scroll infinito)?', category: 'destruir' },
  { id: '7', text: '¿Oré o medité usando alguna app o contenido digital?', category: 'crear' },
  { id: '8', text: '¿Participé en discusiones destructivas online?', category: 'destruir' },
];

const oracionCoder = `Arquitecto Supremo,
Tú que compilaste el universo con la Palabra (Logos):

Dame claridad para escribir código limpio y útil.
Que elimine los "bugs" del egoísmo en mi vida
y que cada línea que escriba sirva para 
conectar, ayudar y elevar la dignidad humana.

San Isidoro de Sevilla y Beato Carlo Acutis,
rueguen por mi red.

Amén.`;

export function LaboratorioVirtudes() {
  const [isExamenOpen, setIsExamenOpen] = useState(false);
  const [isOracionOpen, setIsOracionOpen] = useState(false);
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

  const crearCount = checkedItems.filter(id => 
    examenItems.find(item => item.id === id)?.category === 'crear'
  ).length;

  const destruirCount = checkedItems.filter(id => 
    examenItems.find(item => item.id === id)?.category === 'destruir'
  ).length;

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
            <p className="text-gray-400 text-sm">Prácticas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Examen Digital Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExamenOpen(true)}
            className="glass-cyber rounded-2xl p-6 border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-400/30 transition-colors">
                <Microscope className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  Examen Digital
                </h3>
                <p className="text-gray-400 text-sm">
                  ¿Usaste tu tecnología para crear o destruir hoy?
                </p>
              </div>
            </div>
          </motion.button>

          {/* Oración del Coder Card */}
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
                  Oración del Programador
                </h3>
                <p className="text-gray-400 text-sm">
                  Santificando el algoritmo.
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Examen Digital Modal */}
      <Dialog open={isExamenOpen} onOpenChange={setIsExamenOpen}>
        <DialogContent className="glass-cyber border-emerald-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-emerald-400" />
              Examen Digital
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-gray-400 text-sm">
              Reflexiona sobre tu uso de la tecnología hoy:
            </p>
            
            <div className="space-y-3">
              {examenItems.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    checkedItems.includes(item.id)
                      ? item.category === 'crear'
                        ? 'bg-emerald-400/20 border border-emerald-400/40'
                        : 'bg-red-400/20 border border-red-400/40'
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
                <p className="text-sm text-gray-400 mb-2">Tu balance de hoy:</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-medium">{crearCount} crear</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-red-400 font-medium">{destruirCount} destruir</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={resetExamen}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Completar Examen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Oración del Coder Modal */}
      <Dialog open={isOracionOpen} onOpenChange={setIsOracionOpen}>
        <DialogContent className="glass-cyber border-cyan-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              Oración del Programador
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="glass-cyber rounded-xl p-6 border-amber-400/20 mb-4">
              <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {oracionCoder}
              </pre>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p>
                San Isidoro de Sevilla, patrón de internet. Beato Carlo Acutis, 
                joven programador que usó la tecnología para evangelizar.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
