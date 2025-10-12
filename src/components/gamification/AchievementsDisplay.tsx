import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Achievement {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
}

interface UserAchievement {
  achievement_id: string;
  desbloqueado_en: string;
}

interface AchievementsDisplayProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

export const AchievementsDisplay = ({
  achievements,
  userAchievements,
}: AchievementsDisplayProps) => {
  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockDate = (achievementId: string) => {
    const ua = userAchievements.find(ua => ua.achievement_id === achievementId);
    return ua ? new Date(ua.desbloqueado_en) : null;
  };

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.categoria]) {
      acc[achievement.categoria] = [];
    }
    acc[achievement.categoria].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const getCategoryName = (categoria: string) => {
    const names: Record<string, string> = {
      debates: "Debates",
      lecciones: "Lecciones",
      racha: "Racha de Días",
      puntos: "Puntos Totales",
    };
    return names[categoria] || categoria;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Logros</CardTitle>
          </div>
          <Badge variant="secondary">
            {unlockedCount} / {totalCount}
          </Badge>
        </div>
        <CardDescription>
          Desbloquea logros completando debates, lecciones y manteniendo tu racha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedAchievements).map(([categoria, achievementsList]) => (
            <div key={categoria}>
              <h3 className="font-semibold mb-3">{getCategoryName(categoria)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievementsList.map((achievement) => {
                  const unlocked = isUnlocked(achievement.id);
                  const unlockDate = getUnlockDate(achievement.id);

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        unlocked
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/30 border-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${unlocked ? "" : "opacity-30"}`}>
                          {unlocked ? achievement.icono : <Lock className="h-8 w-8" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${unlocked ? "" : "text-muted-foreground"}`}>
                            {achievement.nombre}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.descripcion}
                          </p>
                          {unlocked && unlockDate && (
                            <p className="text-xs text-primary mt-1">
                              Desbloqueado el {format(unlockDate, "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
