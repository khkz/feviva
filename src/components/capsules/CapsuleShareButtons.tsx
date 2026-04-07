import { Share2, MessageCircle, Copy, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DailyCapsule } from "@/hooks/useDailyCapsule";

interface CapsuleShareButtonsProps {
  capsule: DailyCapsule;
  onShare?: () => void;
}

export const CapsuleShareButtons = ({ capsule, onShare }: CapsuleShareButtonsProps) => {
  const shareText = `${capsule.emoji_icon} ${capsule.dato_impactante}\n\n${capsule.reflexion}\n\n— elrugido.com/capsula-del-dia`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cápsula del día — ElRugido",
          text: shareText,
          url: "https://elrugido.com/capsula-del-dia",
        });
        onShare?.();
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    onShare?.();
  };

  const handleTwitter = () => {
    const tweetText = `${capsule.emoji_icon} ${capsule.dato_impactante}\n\n${capsule.reflexion}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent("https://elrugido.com/capsula-del-dia")}`,
      "_blank"
    );
    onShare?.();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success("Cápsula copiada al portapapeles");
    onShare?.();
  };

  return (
    <div className="flex items-center gap-2">
      {navigator.share && (
        <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5">
          <Share2 className="w-4 h-4" /> Compartir
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={handleWhatsApp} className="text-primary hover:text-primary/80">
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleTwitter}>
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleCopy}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
};
