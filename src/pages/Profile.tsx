import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User, Palette, Bell, ChevronRight } from "lucide-react";
import { z } from "zod";
import { ThemeSelector } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useNotifications } from "@/hooks/useNotifications";

const COUNTRY_OPTIONS = [
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
];

const profileSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  pais: z.string().max(100, "Máximo 100 caracteres").optional(),
  country_code: z.string().max(2).optional(),
  iglesia: z.string().max(200, "Máximo 200 caracteres").optional(),
  perfil_doctrinal: z.enum(["evangelico", "catolico", "pentecostal", "no_denominacional", "otro"]),
  edad_segmento: z.enum(["18-25", "26-35", "36-50", "51+"]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { practiceReminders } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: "",
    pais: "",
    country_code: undefined,
    iglesia: "",
    perfil_doctrinal: "evangelico",
    edad_segmento: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const enabledRemindersCount = practiceReminders.filter(r => r.enabled).length;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!error && data) {
      setFormData({
        nombre: data.nombre || "",
        pais: data.pais || "",
        country_code: data.country_code || undefined,
        iglesia: data.iglesia || "",
        perfil_doctrinal: data.perfil_doctrinal || "evangelico",
        edad_segmento: data.edad_segmento || undefined,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = profileSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nombre: formData.nombre,
        pais: formData.pais || null,
        country_code: formData.country_code || null,
        iglesia: formData.iglesia || null,
        perfil_doctrinal: formData.perfil_doctrinal,
        edad_segmento: formData.edad_segmento || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados correctamente",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <User className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 container mx-auto px-4 py-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-button text-foreground hover:bg-background/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Mi Perfil</h1>
              <p className="text-white/80">Gestiona tu información personal</p>
            </div>
          </div>
        </motion.header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Theme Selector Card */}
          <Card className="mb-6 glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Apariencia</CardTitle>
                  <CardDescription>
                    Selecciona el tema de la aplicación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Reminders Card */}
          <Card className="mb-6 glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Recordatorios</CardTitle>
                  <CardDescription>
                    {enabledRemindersCount > 0 
                      ? `${enabledRemindersCount} práctica${enabledRemindersCount > 1 ? 's' : ''} configurada${enabledRemindersCount > 1 ? 's' : ''}`
                      : "Configura tus recordatorios diarios"
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate('/profile/reminders')}
              >
                <span>Configurar recordatorios</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información y preferencias
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre completo"
                    className={`glass-button bg-background/50 ${errors.nombre ? "border-destructive" : ""}`}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perfil_doctrinal">Perfil Doctrinal *</Label>
                  <Select
                    value={formData.perfil_doctrinal}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, perfil_doctrinal: value })
                    }
                  >
                    <SelectTrigger className="glass-button bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="evangelico">Evangélico</SelectItem>
                      <SelectItem value="catolico">Católico</SelectItem>
                      <SelectItem value="pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="no_denominacional">No Denominacional</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.perfil_doctrinal && (
                    <p className="text-sm text-destructive">{errors.perfil_doctrinal}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad_segmento">Rango de Edad</Label>
                  <Select
                    value={formData.edad_segmento || ""}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, edad_segmento: value || undefined })
                    }
                  >
                    <SelectTrigger className="glass-button bg-background/50">
                      <SelectValue placeholder="Selecciona tu rango de edad" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="18-25">18-25 años</SelectItem>
                      <SelectItem value="26-35">26-35 años</SelectItem>
                      <SelectItem value="36-50">36-50 años</SelectItem>
                      <SelectItem value="51+">51+ años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_code">País</Label>
                  <Select
                    value={formData.country_code || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country_code: value || undefined })
                    }
                  >
                    <SelectTrigger className="glass-button bg-background/50">
                      <SelectValue placeholder="Selecciona tu país" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50 max-h-60">
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iglesia">Iglesia / Comunidad</Label>
                  <Input
                    id="iglesia"
                    value={formData.iglesia}
                    onChange={(e) => setFormData({ ...formData, iglesia: e.target.value })}
                    placeholder="Nombre de tu iglesia o comunidad"
                    className="glass-button bg-background/50"
                  />
                </div>

                <Button type="submit" className="w-full shadow-glow" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <BottomNavigation />
      </div>
    </div>
  );
};

export default Profile;
