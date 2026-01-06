import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  userName: string;
  verse?: {
    text: string;
    reference: string;
  };
}

export function HeroSection({ userName, verse }: HeroSectionProps) {
  return (
    <section className="relative h-[45vh] min-h-[320px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
          alt="Contemplative mountain landscape"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="glass-hero absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-8">
        {/* Logo */}
        <div className="absolute top-5 left-5 flex items-center gap-2">
          <div className="glass-button rounded-full p-2">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <span className="text-foreground/80 font-semibold text-lg">FeViva</span>
        </div>

        {/* Greeting Card */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <p className="text-muted-foreground text-sm mb-1">Buenos días</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {userName || "Peregrino"}
          </h1>
        </div>

        {/* Verse of the Day */}
        {verse && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-foreground/90 text-sm italic leading-relaxed">
              "{verse.text}"
            </p>
            <p className="text-muted-foreground text-xs mt-2">— {verse.reference}</p>
          </div>
        )}
      </div>
    </section>
  );
}
