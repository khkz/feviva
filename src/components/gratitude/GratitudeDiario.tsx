import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface GratitudeDiarioProps {
  gratitudes: string[];
  onChange: (index: number, value: string) => void;
}

export const GratitudeDiario = ({ gratitudes, onChange }: GratitudeDiarioProps) => {
  const filledCount = gratitudes.filter(g => g.trim().length > 0).length;
  
  return (
    <Card className="border-0 bg-gradient-to-br from-rose-500/5 via-background to-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <span>Tu gratitud de hoy</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {filledCount}/3
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Escribe 3 cosas por las que agradeces a Dios hoy
        </p>

        <div className="space-y-3">
          {gratitudes.map((gratitude, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <span className="absolute left-3 top-3 text-sm font-bold text-amber-500">
                {index + 1}.
              </span>
              <Textarea
                value={gratitude}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={
                  index === 0 ? "Agradezco a Dios por..." :
                  index === 1 ? "También doy gracias por..." :
                  "Y estoy agradecido por..."
                }
                className="pl-8 min-h-[80px] resize-none border-amber-200/50 focus:border-amber-400 dark:border-amber-800/50"
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
