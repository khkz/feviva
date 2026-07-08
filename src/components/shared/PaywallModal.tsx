import { Link } from "react-router-dom";
import { X, Infinity, BookOpen, Route } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export const PaywallModal = ({ open, onClose }: PaywallModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30 bg-gradient-to-b from-background to-primary/5">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Desata tu formación
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ya probaste lo que ElRugido puede hacer. Lleva tu fe al siguiente nivel.
          </p>

          <ul className="space-y-3 text-left mb-6">
            <li className="flex items-start gap-3">
              <span className="p-2 rounded-full bg-primary/15 text-primary">
                <Infinity className="w-4 h-4" />
              </span>
              <span className="text-sm pt-1.5">Coach de Debate ilimitado</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="p-2 rounded-full bg-primary/15 text-primary">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-sm pt-1.5">Toda la Biblioteca</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="p-2 rounded-full bg-primary/15 text-primary">
                <Route className="w-4 h-4" />
              </span>
              <span className="text-sm pt-1.5">Ruta del Apóstol completa</span>
            </li>
          </ul>

          <Button asChild size="lg" className="w-full">
            <Link to="/planes" onClick={onClose}>Ver planes</Link>
          </Button>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Ahora no
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
