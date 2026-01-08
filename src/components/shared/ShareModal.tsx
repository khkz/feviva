import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Facebook, 
  MessageCircle, 
  Mail, 
  Link2, 
  Share2,
  X
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  reference?: string;
}

export const ShareModal = ({ isOpen, onClose, title, text, reference }: ShareModalProps) => {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const shareText = reference ? `"${text}" - ${reference}` : text;
  const shareUrl = window.location.href;

  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      color: "bg-[#1877F2]",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}&u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "Mensajes",
      icon: <MessageCircle className="h-6 w-6" />,
      color: "bg-[#34C759]",
      action: () => {
        window.open(`sms:?body=${encodeURIComponent(shareText)}`);
      },
    },
    {
      name: "X",
      icon: <X className="h-6 w-6" />,
      color: "bg-black",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: "bg-[#25D366]",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      },
    },
    {
      name: "Copiar enlace",
      icon: <Link2 className="h-6 w-6" />,
      color: "bg-muted",
      textColor: "text-foreground",
      action: async () => {
        setCopying(true);
        try {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Copiado",
            description: "Texto copiado al portapapeles",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo copiar el texto",
            variant: "destructive",
          });
        }
        setCopying(false);
      },
    },
    {
      name: "Correo electrónico",
      icon: <Mail className="h-6 w-6" />,
      color: "bg-muted",
      textColor: "text-foreground",
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`
        );
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Compartir</DialogTitle>
        </DialogHeader>

        {/* Preview Card */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-900 to-stone-900 p-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIiBkPSJNMjAgMGMxMS4wNDYgMCAyMCA4Ljk1NCAyMCAyMHMtOC45NTQgMjAtMjAgMjBTMCAzMS4wNDYgMCAyMCA4Ljk1NCAwIDIwIDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
          
          <div className="relative bg-white rounded-lg p-4 shadow-xl mx-auto max-w-[200px]">
            <p className="text-gray-800 text-sm font-serif italic text-center leading-relaxed">
              "{text.length > 100 ? text.substring(0, 100) + "..." : text}"
            </p>
            {reference && (
              <p className="text-gray-600 text-xs text-center mt-3 font-medium">
                {reference}
              </p>
            )}
          </div>

          <div className="text-center mt-4">
            <p className="text-white/90 text-sm font-medium line-clamp-2">
              {text.length > 60 ? text.substring(0, 60) + "..." : text}
            </p>
            {reference && (
              <p className="text-white/70 text-xs mt-1">{reference}</p>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-6 gap-2 pt-2">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color} ${option.textColor || "text-white"}`}
              >
                {option.icon}
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Native Share Button (for mobile) */}
        {navigator.share && (
          <Button onClick={handleNativeShare} variant="outline" className="w-full mt-2">
            <Share2 className="h-4 w-4 mr-2" />
            Más opciones
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
