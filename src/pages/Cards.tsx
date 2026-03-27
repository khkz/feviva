import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

interface ArgumentCard {
  id: string;
  tema: string;
  resumen_30s: string;
  resumen_2min: string;
  resumen_5min: string;
  citas_biblicas: any;
  puentes_empaticos: any;
}

const Cards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<ArgumentCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ArgumentCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from("argument_cards")
      .select("*")
      .eq("estado", "publicado");

    if (error) {
      console.error("Error fetching cards:", error);
    } else {
      setCards(data || []);
      if (data && data.length > 0) {
        setSelectedCard(data[0]);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <BookOpen className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      <header className="bg-primary text-white shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-secondary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-secondary" />
            <div>
              <h1 className="font-heading text-3xl font-bold">Tarjetas de Argumento</h1>
              <p className="text-white/80">Respuestas estructuradas a objeciones comunes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {cards.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>
                Las tarjetas de argumento estarán disponibles pronto
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with card list */}
            <div className="lg:col-span-1 space-y-2">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className={`cursor-pointer transition-smooth ${
                    selectedCard?.id === card.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCard(card)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{card.tema}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              {selectedCard && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{selectedCard.tema}</CardTitle>
                      <Badge variant="secondary">Publicado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="30s" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="30s">
                          <Clock className="w-4 h-4 mr-2" />
                          30 seg
                        </TabsTrigger>
                        <TabsTrigger value="2min">
                          <Clock className="w-4 h-4 mr-2" />
                          2 min
                        </TabsTrigger>
                        <TabsTrigger value="5min">
                          <Clock className="w-4 h-4 mr-2" />
                          5 min
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="30s" className="space-y-4 mt-6">
                        <div className="bg-accent p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Respuesta Rápida (30 segundos)</h3>
                          <p className="text-muted-foreground">{selectedCard.resumen_30s}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="2min" className="space-y-4 mt-6">
                        <div className="bg-accent p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Respuesta Moderada (2 minutos)</h3>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedCard.resumen_2min}
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="5min" className="space-y-4 mt-6">
                        <div className="bg-accent p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Respuesta Profunda (5 minutos)</h3>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedCard.resumen_5min}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {selectedCard.citas_biblicas && selectedCard.citas_biblicas.length > 0 && (
                      <div className="mt-6 bg-primary/5 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Fundamentos Bíblicos</h3>
                        <div className="space-y-3">
                          {selectedCard.citas_biblicas.map((cita: any, index: number) => (
                            <div key={index} className="text-sm">
                              <p className="text-muted-foreground italic">
                                "{cita.texto}"
                              </p>
                              <p className="text-primary font-medium mt-1">
                                — {cita.referencia}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCard.puentes_empaticos && selectedCard.puentes_empaticos.length > 0 && (
                      <div className="mt-6 bg-secondary/10 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Puentes Empáticos</h3>
                        <div className="space-y-4">
                          {selectedCard.puentes_empaticos.map((item: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                {item.puente}
                              </p>
                              {item.contexto && (
                                <p className="text-xs text-secondary font-medium">
                                  {item.contexto}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cards;