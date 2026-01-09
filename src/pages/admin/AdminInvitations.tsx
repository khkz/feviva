import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  Mail, 
  User, 
  Upload, 
  Send, 
  Trash2, 
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Users
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InvitationDraft {
  email: string;
  name: string;
}

interface Invitation {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  personal_message: string | null;
  status: string;
  invite_code: string;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

const AdminInvitations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [drafts, setDrafts] = useState<InvitationDraft[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['gift-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
  });

  // Get current user for sender info
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', user.id)
        .single();
      
      return { id: user.id, nombre: data?.nombre || 'ElRugido' };
    },
  });

  // Add to drafts
  const addToDrafts = () => {
    if (!email) {
      toast({
        title: 'Email requerido',
        description: 'Por favor ingresa un email válido.',
        variant: 'destructive',
      });
      return;
    }

    if (drafts.some(d => d.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: 'Email duplicado',
        description: 'Este email ya está en la lista.',
        variant: 'destructive',
      });
      return;
    }

    setDrafts([...drafts, { email, name }]);
    setEmail('');
    setName('');
  };

  // Remove from drafts
  const removeFromDrafts = (emailToRemove: string) => {
    setDrafts(drafts.filter(d => d.email !== emailToRemove));
  };

  // Parse CSV
  const parseCsv = () => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const newDrafts: InvitationDraft[] = [];
    
    lines.forEach(line => {
      const [emailPart, namePart] = line.split(',').map(s => s.trim());
      if (emailPart && emailPart.includes('@')) {
        if (!drafts.some(d => d.email.toLowerCase() === emailPart.toLowerCase()) &&
            !newDrafts.some(d => d.email.toLowerCase() === emailPart.toLowerCase())) {
          newDrafts.push({ email: emailPart, name: namePart || '' });
        }
      }
    });

    setDrafts([...drafts, ...newDrafts]);
    setCsvContent('');
    setShowCsvDialog(false);
    
    toast({
      title: 'Contactos importados',
      description: `Se agregaron ${newDrafts.length} contactos a la lista.`,
    });
  };

  // Send invitations
  const sendInvitations = async () => {
    if (drafts.length === 0) {
      toast({
        title: 'Lista vacía',
        description: 'Agrega al menos un email a la lista.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const draft of drafts) {
      try {
        // Create invitation in database
        const { data: invitation, error: insertError } = await supabase
          .from('gift_invitations')
          .insert({
            sender_id: currentUser?.id,
            recipient_email: draft.email,
            recipient_name: draft.name || null,
            personal_message: personalMessage || null,
            status: 'pending',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Send email via edge function
        const { error: sendError } = await supabase.functions.invoke('send-gift-invitation', {
          body: {
            invitationId: invitation.id,
            recipientEmail: draft.email,
            recipientName: draft.name,
            personalMessage: personalMessage,
            senderName: currentUser?.nombre || 'Un amigo',
          },
        });

        if (sendError) {
          console.error('Error sending email:', sendError);
          // Update status to pending (email failed but invitation created)
        }

        successCount++;
      } catch (error) {
        console.error('Error creating invitation:', error);
        errorCount++;
      }
    }

    setIsSending(false);
    setDrafts([]);
    setPersonalMessage('');
    queryClient.invalidateQueries({ queryKey: ['gift-invitations'] });

    toast({
      title: 'Invitaciones enviadas',
      description: `${successCount} enviadas correctamente${errorCount > 0 ? `, ${errorCount} fallaron` : ''}.`,
    });
  };

  // Stats
  const stats = {
    total: invitations?.length || 0,
    pending: invitations?.filter(i => i.status === 'pending').length || 0,
    sent: invitations?.filter(i => i.status === 'sent').length || 0,
    accepted: invitations?.filter(i => i.status === 'accepted').length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Mail className="w-3 h-3 mr-1" /> Enviada</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Aceptada</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground"><XCircle className="w-3 h-3 mr-1" /> Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-secondary" />
            Regalar Membresía
          </h1>
          <p className="text-muted-foreground">
            Invita a amigos y familiares a unirse a ElRugido
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Enviadas</span>
            </div>
            <p className="text-2xl font-bold">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Aceptadas</span>
            </div>
            <p className="text-2xl font-bold">{stats.accepted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Invitaciones</CardTitle>
          <CardDescription>
            Agrega emails a la lista y envía invitaciones personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add single contact */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="name" className="sr-only">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={addToDrafts} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {/* Import CSV */}
          <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importar desde CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Contactos</DialogTitle>
                <DialogDescription>
                  Pega los datos en formato CSV (email,nombre). Un contacto por línea.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="juan@email.com,Juan&#10;maria@email.com,María&#10;pedro@email.com"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={8}
              />
              <Button onClick={parseCsv} disabled={!csvContent.trim()}>
                Importar Contactos
              </Button>
            </DialogContent>
          </Dialog>

          {/* Drafts list */}
          {drafts.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Lista de invitaciones ({drafts.length})
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDrafts([])}
                  className="text-destructive hover:text-destructive"
                >
                  Limpiar todo
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {drafts.map((draft, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{draft.email}</span>
                      {draft.name && (
                        <span className="text-sm text-muted-foreground">({draft.name})</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => removeFromDrafts(draft.email)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje personal (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje personal para incluir en la invitación..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={sendInvitations} 
            disabled={drafts.length === 0 || isSending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Enviando...' : `Enviar ${drafts.length} invitación${drafts.length !== 1 ? 'es' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Invitations History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Invitaciones</CardTitle>
          <CardDescription>
            Todas las invitaciones enviadas y su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando...
            </div>
          ) : invitations && invitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviada</TableHead>
                  <TableHead>Aceptada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invitation.recipient_email}</p>
                        {invitation.recipient_name && (
                          <p className="text-sm text-muted-foreground">{invitation.recipient_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.sent_at 
                        ? format(new Date(invitation.sent_at), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.accepted_at 
                        ? format(new Date(invitation.accepted_at), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay invitaciones enviadas aún</p>
              <p className="text-sm">Comienza agregando emails arriba</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvitations;
