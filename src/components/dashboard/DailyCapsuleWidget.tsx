import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CapsuleCard } from "@/components/capsules/CapsuleCard";
import { CapsuleShareButtons } from "@/components/capsules/CapsuleShareButtons";
import { useDailyCapsule } from "@/hooks/useDailyCapsule";

export const DailyCapsuleWidget = () => {
  const { capsule, isLoading, incrementShare } = useDailyCapsule();

  if (isLoading || !capsule) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Cápsula del día</span>
          </div>
          <Link to="/capsula-del-dia" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver más <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <CapsuleCard capsule={capsule} variant="compact" />
        <div className="flex justify-end">
          <CapsuleShareButtons capsule={capsule} onShare={() => incrementShare(capsule.id)} />
        </div>
      </CardContent>
    </Card>
  );
};
