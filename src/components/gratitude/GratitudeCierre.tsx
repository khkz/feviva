import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Check, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/shared/ShareModal";

interface GratitudeCierreProps {
  reflexionBiblica?: string | null;
  versiculoSugerido?: string | null;
}

export const GratitudeCierre = ({ reflexionBiblica, versiculoSugerido }: GratitudeCierreProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  return (
    <Card className="border-0 overflow-hidden bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10">
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h3 className="text-xl font-bold">¡Gratitud completada!</h3>
          <p className="text-muted-foreground text-sm">
            Tu reflexión bíblica de hoy
          </p>
        </motion.div>

        {reflexionBiblica && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background/50 rounded-xl p-5 text-left"
          >
            <div className="flex items-start gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground italic leading-relaxed">
                {reflexionBiblica}
              </p>
            </div>
            {versiculoSugerido && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-right">
                — {versiculoSugerido}
              </p>
            )}
          </motion.div>
        )}

        {reflexionBiblica && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir reflexión
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Bendición del día</span>
          </div>
          <p className="text-muted-foreground italic text-sm">
            "Con los pies en la tierra, pero con el corazón en el cielo."
          </p>
        </motion.div>
      </CardContent>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Mi reflexión de gratitud"
        text={reflexionBiblica || "Gratitud completada"}
        reference={versiculoSugerido || undefined}
      />
    </Card>
  );
};
