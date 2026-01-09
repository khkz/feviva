import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Shield, Star, Cross } from "lucide-react";
import logoElRugido from "@/assets/logo-elrugido.svg";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Invitation state
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [perfilDoctrinal, setPerfilDoctrinal] = useState("evangelico");
  const [edadSegmento, setEdadSegmento] = useState("");

  // Check for invite code on mount
  useEffect(() => {
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteCode(invite);
      // Fetch invitation details
      supabase
        .from('gift_invitations')
        .select('recipient_name, sender_id, profiles!gift_invitations_sender_id_fkey(nombre)')
        .eq('invite_code', invite)
        .eq('status', 'sent')
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            // Set the recipient email if available
            if (data.recipient_name) {
              setSignupName(data.recipient_name);
            }
          }
        });
    }
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
      } else if (event === "SIGNED_IN" && !showResetPassword) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const isResetFlow = searchParams.get("reset") === "true";
      if (session && !isResetFlow) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, showResetPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión correctamente.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error al enviar correo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nombre: signupName,
            perfil_doctrinal: perfilDoctrinal,
            edad_segmento: edadSegmento,
          },
        },
      });

      if (error) throw error;

      // Mark invitation as accepted if there was an invite code
      if (inviteCode && signUpData.user) {
        try {
          await supabase
            .from('gift_invitations')
            .update({
              status: 'accepted',
              accepted_at: new Date().toISOString(),
            })
            .eq('invite_code', inviteCode);
        } catch (inviteError) {
          console.error("Error updating invitation:", inviteError);
        }
      }

      // Send welcome email via edge function
      try {
        await supabase.functions.invoke('send-auth-email', {
          body: {
            type: 'welcome',
            email: signupEmail,
            name: signupName,
          },
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't block signup if email fails
      }

      toast({
        title: inviteCode ? "¡Bienvenido a ElRugido!" : "¡Cuenta creada!",
        description: inviteCode 
          ? "Tu invitación ha sido aceptada. ¡Comienza tu entrenamiento de fe!"
          : "Ya puedes comenzar tu entrenamiento de fe.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show reset password form if in recovery mode
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-hover to-primary p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
              <img src={logoElRugido} alt="ElRugido" className="w-20 h-20" />
              <h1 className="font-heading text-4xl font-bold text-white">
                ElRugido
              </h1>
              <span className="text-sm text-white/60">elrugido.com</span>
            </div>
            <p className="text-white/70">Restablece tu contraseña</p>
          </div>

          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
              <CardDescription>
                Ingresa tu nueva contraseña para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary-hover text-primary" disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-hover to-primary relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-white/5 blur-2xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-start gap-3 mb-8">
              <img src={logoElRugido} alt="ElRugido" className="w-24 h-24" />
              <h1 className="font-heading text-5xl font-bold text-white">
                ElRugido
              </h1>
              <span className="text-sm text-white/60">elrugido.com</span>
            </div>

            <h2 className="font-heading text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
              Ruge tu fe.<br />
              Defiende tu esperanza.<br />
              <span className="text-secondary">Ama sin límites.</span>
            </h2>

            <p className="text-lg text-white/70 mb-10 max-w-md">
              Únete a miles de cristianos que fortalecen su fe con apologética, 
              hábitos espirituales y comunidad.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: <Cross className="w-5 h-5" />, text: "Coach de debate" },
                { icon: <Shield className="w-5 h-5" />, text: "Tarjetas de argumentos" },
                { icon: <Star className="w-5 h-5" />, text: "Comunidad de apoyo" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-accent/30 to-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <img src={logoElRugido} alt="ElRugido" className="w-16 h-16" />
              <h1 className="font-heading text-3xl font-bold text-primary">
                ElRugido
              </h1>
              <span className="text-xs text-muted-foreground">elrugido.com</span>
            </div>
            <p className="text-muted-foreground">Ruge tu fe con verdad y amor</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="login" className="text-base">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup" className="text-base">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-xl border-border/50">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">
                    {showForgotPassword ? "Recuperar contraseña" : "¡Bienvenido de vuelta!"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {showForgotPassword 
                      ? "Te enviaremos un correo para restablecer tu contraseña"
                      : "Ingresa tus credenciales para continuar"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {showForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Correo electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary-hover text-primary" disabled={loading}>
                        <Mail className="w-4 h-4 mr-2" />
                        {loading ? "Enviando..." : "Enviar correo de recuperación"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al inicio de sesión
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Correo electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="pl-10 pr-10 h-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary-hover text-primary" disabled={loading}>
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                      </Button>
                      <div className="text-center">
                        <Button 
                          type="button" 
                          variant="link" 
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          ¿Olvidaste tu contraseña?
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="shadow-xl border-border/50">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Únete a ElRugido</CardTitle>
                  <CardDescription className="text-base">
                    Comienza tu entrenamiento de apologética
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Tu nombre"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="tu@correo.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-10 pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="perfil-doctrinal">Perfil Doctrinal</Label>
                        <Select value={perfilDoctrinal} onValueChange={setPerfilDoctrinal}>
                          <SelectTrigger id="perfil-doctrinal" className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="catolico">Católico</SelectItem>
                            <SelectItem value="evangelico">Evangélico</SelectItem>
                            <SelectItem value="pentecostal">Pentecostal</SelectItem>
                            <SelectItem value="no_denominacional">No Denominacional</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edad-segmento">Rango de Edad</Label>
                        <Select value={edadSegmento} onValueChange={setEdadSegmento} required>
                          <SelectTrigger id="edad-segmento" className="h-12">
                            <SelectValue placeholder="Edad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="18-25">18-25</SelectItem>
                            <SelectItem value="26-35">26-35</SelectItem>
                            <SelectItem value="36-50">36-50</SelectItem>
                            <SelectItem value="51+">51+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary-hover text-primary" disabled={loading}>
                      {loading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
