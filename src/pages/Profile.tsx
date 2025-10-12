import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  pais: z.string().max(100, "Máximo 100 caracteres").optional(),
  iglesia: z.string().max(200, "Máximo 200 caracteres").optional(),
  perfil_doctrinal: z.enum(["evangelico", "catolico", "pentecostal", "no_denominacional", "otro"]),
  edad_segmento: z.enum(["18-25", "26-35", "36-50", "51+"]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: "",
    pais: "",
    iglesia: "",
    perfil_doctrinal: "evangelico",
    edad_segmento: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Validar con zod
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Mi Perfil</CardTitle>
            </div>
            <CardDescription>
              Actualiza tu información personal y preferencias
            </CardDescription>
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
                  className={errors.nombre ? "border-destructive" : ""}
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rango de edad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 años</SelectItem>
                    <SelectItem value="26-35">26-35 años</SelectItem>
                    <SelectItem value="36-50">36-50 años</SelectItem>
                    <SelectItem value="51+">51+ años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  placeholder="Tu país de residencia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iglesia">Iglesia / Comunidad</Label>
                <Input
                  id="iglesia"
                  value={formData.iglesia}
                  onChange={(e) => setFormData({ ...formData, iglesia: e.target.value })}
                  placeholder="Nombre de tu iglesia o comunidad"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
