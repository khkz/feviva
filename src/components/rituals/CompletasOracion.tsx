import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Moon } from "lucide-react";

interface CompletasOracionProps {
  contenido: string;
}

export const CompletasOracion = ({ contenido }: CompletasOracionProps) => {
  // Split by paragraphs or lines for better formatting
  const paragraphs = contenido.split('\n').filter(p => p.trim());

  return (
    <Card className="border-indigo-200/50 bg-gradient-to-b from-indigo-50/30 to-background dark:from-indigo-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Moon className="h-5 w-5" />
          Oración de Completas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4 text-foreground">
            {paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                className={`leading-relaxed ${
                  paragraph.startsWith('V.') || paragraph.startsWith('R.') 
                    ? 'font-medium' 
                    : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
