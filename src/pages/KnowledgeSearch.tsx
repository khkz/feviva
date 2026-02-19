import { useState } from "react";
import { Search, BookOpen, Sparkles, ArrowLeft, Loader2, BookMarked, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_QUESTIONS = [
  "¿Qué dice el Catecismo sobre la Eucaristía?",
  "¿Cuál es el propósito del sufrimiento?",
  "¿Qué enseña la Iglesia sobre la Trinidad?",
  "¿Qué dice la Biblia sobre el perdón?",
  "¿Qué es la gracia santificante?",
  "¿Por qué rezar el Rosario?",
];

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  catecismo: { label: "Catecismo", color: "bg-primary/10 text-primary" },
  biblia: { label: "Biblia", color: "bg-secondary/20 text-secondary-foreground" },
  doctrina: { label: "Doctrina", color: "bg-accent text-accent-foreground" },
};

const KnowledgeSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | undefined>();
  const { search, isSearching, result, clearResult } = useSemanticSearch();

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    if (q) setQuery(q);
    search(searchQuery, selectedSource);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex-1 md:ml-64">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Búsqueda Inteligente
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulta el Catecismo y la Biblia con IA
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="¿Qué quieres saber sobre la fe católica?"
              className="pl-10 pr-20 h-12 text-base"
              disabled={isSearching}
            />
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Source Filters */}
          <div className="flex gap-2 mb-6">
            <Badge
              variant={!selectedSource ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedSource(undefined)}
            >
              Todos
            </Badge>
            {Object.entries(SOURCE_LABELS).map(([key, { label }]) => (
              <Badge
                key={key}
                variant={selectedSource === key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSource(selectedSource === key ? undefined : key)}
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Buscando en la base de conocimientos...
                </p>
              </motion.div>
            )}

            {!isSearching && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Answer Card */}
                <Card className="p-5 mb-4 border-primary/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        Respuesta
                      </h3>
                      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                        {result.answer}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Sources */}
                {result.sources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <BookMarked className="w-4 h-4" />
                      Fuentes ({result.sources.length})
                    </h4>
                    {result.sources.map((src, idx) => {
                      const sourceInfo = SOURCE_LABELS[src.source] || {
                        label: src.source,
                        color: "bg-muted text-muted-foreground",
                      };
                      return (
                        <Card
                          key={idx}
                          className="p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${sourceInfo.color}`}
                            >
                              {sourceInfo.label}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {src.reference}
                            </span>
                            {src.title && (
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                — {src.title}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {src.similarity}%
                          </span>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* New search */}
                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => {
                    clearResult();
                    setQuery("");
                  }}
                >
                  Nueva búsqueda
                </Button>
              </motion.div>
            )}

            {!isSearching && !result && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Preguntas sugeridas
                </p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <Card
                      key={idx}
                      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors flex items-center justify-between"
                      onClick={() => handleSearch(q)}
                    >
                      <span className="text-sm text-foreground">{q}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default KnowledgeSearch;
