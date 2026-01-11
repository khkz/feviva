import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useReferrals } from '@/hooks/useReferrals';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  Trophy, 
  Sparkles, 
  MessageCircle,
  Link2,
  Crown,
  Medal
} from 'lucide-react';

export const ReferralCard = () => {
  const {
    referralCode,
    stats,
    leaderboard,
    loading,
    loadingLeaderboard,
    applyReferralCode,
    getShareLink,
    getWhatsAppMessage,
    copyCode,
    copyLink,
  } = useReferrals();

  const [inputCode, setInputCode] = useState('');

  const handleApplyCode = () => {
    if (inputCode.trim()) {
      applyReferralCode.mutate(inputCode.trim());
      setInputCode('');
    }
  };

  const handleShareWhatsApp = () => {
    const message = getWhatsAppMessage();
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Invita y Gana</CardTitle>
              <CardDescription>
                Gana 100 puntos por cada amigo que se una
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invite" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invite" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Invitar</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Mis Referidos</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Ranking</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Invitar */}
            <TabsContent value="invite" className="space-y-4 mt-4">
              {/* Código de referido */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Tu código personal</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-2xl font-bold tracking-widest text-center bg-background/50 py-3 rounded-lg">
                    {referralCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCode}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botones de compartir */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleShareWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={copyLink}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </div>

              {/* Usar código de otro */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">¿Tienes un código de invitación?</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa el código"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="uppercase"
                    maxLength={12}
                  />
                  <Button 
                    onClick={handleApplyCode}
                    disabled={!inputCode.trim() || applyReferralCode.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Estadísticas */}
            <TabsContent value="stats" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Amigos invitados</p>
                </div>
                <div className="bg-secondary/20 rounded-lg p-4 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <p className="text-3xl font-bold">{stats?.totalPoints || 0}</p>
                  <p className="text-sm text-muted-foreground">Puntos ganados</p>
                </div>
              </div>

              {stats?.referrals && stats.referrals.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Historial de referidos</p>
                  {stats.referrals.slice(0, 5).map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm">Nuevo amigo</span>
                      </div>
                      <Badge variant="secondary">
                        +{ref.points_awarded} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aún no tienes referidos</p>
                  <p className="text-sm">¡Comparte tu código y gana puntos!</p>
                </div>
              )}
            </TabsContent>

            {/* Tab: Leaderboard */}
            <TabsContent value="leaderboard" className="mt-4">
              {loadingLeaderboard ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20'
                          : index === 2
                          ? 'bg-gradient-to-r from-amber-700/20 to-amber-800/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="w-8 text-center font-bold">
                        {index === 0 ? (
                          <Crown className="h-6 w-6 text-yellow-500 mx-auto" />
                        ) : index === 1 ? (
                          <Medal className="h-6 w-6 text-gray-400 mx-auto" />
                        ) : index === 2 ? (
                          <Medal className="h-6 w-6 text-amber-700 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{entry.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.total_referrals} referidos
                        </p>
                      </div>
                      <Badge className="bg-primary">
                        {entry.referral_points} pts
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>¡Sé el primero en el ranking!</p>
                  <p className="text-sm">Invita amigos para aparecer aquí</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
