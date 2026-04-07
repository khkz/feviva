import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookOpen, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';

interface DailyContentRecord {
  id: string;
  fecha: string;
  versiculo_referencia: string;
  versiculo_texto: string;
  reflexion_ia: string;
  tip_apologetico: string;
  oracion_laudes: string;
  oracion_completas: string;
  ensenanza_titulo: string | null;
  ensenanza_contenido: string | null;
  audio_reflexion_url: string | null;
  audio_laudes_url: string | null;
  audio_completas_url: string | null;
  audio_tip_url: string | null;
}

interface DailyContentViewerProps {
  content: DailyContentRecord;
  dateLabel: string;
}

export const DailyContentViewer = ({ content, dateLabel }: DailyContentViewerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewingSection, setViewingSection] = useState<{ title: string; text: string; hasAudio: boolean } | null>(null);

  const sections = [
    { key: 'versiculo', title: '📖 Versículo', text: `${content.versiculo_referencia}\n\n${content.versiculo_texto}`, hasAudio: false },
    { key: 'reflexion', title: '💭 Reflexión', text: content.reflexion_ia, hasAudio: !!content.audio_reflexion_url },
    { key: 'tip', title: '🛡️ Tip Apologético', text: content.tip_apologetico, hasAudio: !!content.audio_tip_url },
    { key: 'laudes', title: '🌅 Laudes', text: content.oracion_laudes, hasAudio: !!content.audio_laudes_url },
    { key: 'completas', title: '🌙 Completas', text: content.oracion_completas, hasAudio: !!content.audio_completas_url },
  ];

  if (content.ensenanza_titulo) {
    sections.push({
      key: 'ensenanza',
      title: `📚 ${content.ensenanza_titulo}`,
      text: content.ensenanza_contenido || '',
      hasAudio: false,
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="text-xs"
      >
        {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
        {expanded ? 'Ocultar' : 'Ver textos'}
      </Button>

      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {sections.map(section => (
            <Button
              key={section.key}
              variant="outline"
              size="sm"
              className="text-xs justify-start h-auto py-2 px-3"
              onClick={() => setViewingSection(section)}
            >
              <div className="flex items-center gap-1 w-full">
                <span className="truncate">{section.title}</span>
                {section.hasAudio ? (
                  <Volume2 className="h-3 w-3 text-green-500 shrink-0" />
                ) : (
                  <VolumeX className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            </Button>
          ))}
        </div>
      )}

      <Dialog open={!!viewingSection} onOpenChange={(open) => { if (!open) setViewingSection(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {viewingSection?.title} — {dateLabel}
            </DialogTitle>
            {viewingSection && (
              <Badge variant={viewingSection.hasAudio ? 'default' : 'secondary'} className="w-fit">
                {viewingSection.hasAudio ? '🔊 Con audio' : '🔇 Sin audio'}
              </Badge>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {viewingSection?.text}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
