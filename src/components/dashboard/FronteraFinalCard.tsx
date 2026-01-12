import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Star, Sparkles } from 'lucide-react';

export function FronteraFinalCard() {
  return (
    <Link to="/frontera-final">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-400/30 p-6 cursor-pointer group"
      >
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-transparent to-amber-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Icon */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 10px rgba(34, 211, 238, 0.3)',
                '0 0 25px rgba(34, 211, 238, 0.5)',
                '0 0 10px rgba(34, 211, 238, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center"
          >
            <Rocket className="w-7 h-7 text-slate-900" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-orbitron font-bold text-white group-hover:text-cyan-400 transition-colors">
                Frontera Final
              </h3>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Donde la Fe conquista el Vacío
            </p>
          </div>

          {/* Badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-medium">
            <Star className="w-3 h-3" />
            Nuevo
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </Link>
  );
}