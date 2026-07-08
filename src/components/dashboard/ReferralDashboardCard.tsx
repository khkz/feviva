import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, MessageCircle, Link2, Crown, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferrals } from "@/hooks/useReferrals";

/**
 * Tarjeta compacta "Invita y gana" para el Dashboard.
 * Muestra recompensa como 7 días de acceso Apóstol (Premium) por referido.
 * La lógica de puntos existente se conserva y se re-etiqueta como "días acumulados"
 * hasta que se active la suscripción de pago.
 */
export const ReferralDashboardCard = () => {
  const { referralCode, stats, loading, getWhatsAppMessage, copyLink } = useReferrals();

  const dias = (stats?.totalReferrals || 0) * 7;

  const handleWhatsApp = () => {
    if (!referralCode) return;
    window.open(`https://wa.me/?text=${getWhatsAppMessage()}`, "_blank");
  };

  if (loading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base leading-tight">Invitá y ganá días Apóstol</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-secondary bg-secondary/10 border border-secondary/30 rounded-full px-2 py-0.5">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cada amigo que se une = <strong className="text-foreground">7 días gratis</strong> de acceso Apóstol para vos. Se acumulan hasta que abramos la suscripción.
              </p>
            </div>
          </div>

          {/* Contadores rápidos */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-center">
              <p className="text-lg font-bold leading-tight">{stats?.totalReferrals || 0}</p>
              <p className="text-[11px] text-muted-foreground">Amigos invitados</p>
            </div>
            <div className="rounded-lg bg-secondary/10 border border-secondary/20 px-3 py-2 text-center">
              <p className="text-lg font-bold leading-tight text-secondary">{dias}</p>
              <p className="text-[11px] text-muted-foreground">Días Apóstol</p>
            </div>
          </div>

          {/* Acciones de compartir */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleWhatsApp}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!referralCode}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>
            <Button
              onClick={copyLink}
              size="sm"
              variant="outline"
              disabled={!referralCode}
            >
              <Link2 className="h-4 w-4 mr-1.5" />
              Copiar link
            </Button>
          </div>

          {referralCode && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Código: <code className="font-mono font-semibold text-foreground tracking-wider">{referralCode}</code>
              </span>
              <Link to="/profile" className="inline-flex items-center gap-1 text-primary hover:underline">
                Ver detalle
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
