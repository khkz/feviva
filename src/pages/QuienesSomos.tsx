import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Church, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageSeo, orgPublisher } from "@/components/seo/PageSeo";

export default function QuienesSomos() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Quiénes somos — ElRugido",
    url: "https://elrugido.com/quienes-somos",
    inLanguage: "es",
    about: {
      "@type": "Organization",
      name: "ElRugido",
      url: "https://elrugido.com",
      foundingDate: "2025",
      founder: { "@type": "Person", name: "Carlos Caro" },
      description:
        "ElRugido es una iniciativa de fieles laicos católicos. Su contenido se fundamenta en el Catecismo de la Iglesia Católica, la Sagrada Escritura y el Magisterio.",
    },
    publisher: orgPublisher(),
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Quiénes somos"
        description="ElRugido nació de la inquietud de Carlos Caro, un fiel laico católico, por ayudar a otros creyentes a conocer, vivir y dar razón de su fe."
        path="/quienes-somos"
        jsonLd={aboutSchema}
      />

      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Inicio
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 space-y-12">
        <section className="text-center space-y-4">
          <img
            src="/logo-elrugido.png"
            alt="Logo de ElRugido"
            className="h-20 w-20 mx-auto"
            width={80}
            height={80}
          />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Detrás de ElRugido
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una iniciativa de laicos católicos al servicio de otros creyentes.
          </p>
        </section>

        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            ElRugido nació de la inquietud de un católico común —{" "}
            <strong className="text-foreground">Carlos Caro</strong>, su
            fundador — por ayudar a otros creyentes a{" "}
            <strong className="text-foreground">conocer, vivir y dar razón
            de su fe</strong>, aprovechando herramientas digitales y de
            inteligencia artificial.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            No hay teólogos ni sacerdotes detrás del proyecto. Somos laicos.
            Por eso ElRugido{" "}
            <strong className="text-foreground">
              no es una publicación oficial de la Iglesia
            </strong>{" "}
            y no sustituye la guía de un párroco, la vida sacramental ni la
            enseñanza del Magisterio. Es, simplemente, una ayuda al servicio
            de la fe.
          </p>

          {/* CARLOS: pegá acá tu testimonio personal y una foto tuya cuando quieras. */}
          {/* <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/90">
                "Tu testimonio va acá..."
              </blockquote> */}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">En qué nos apoyamos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5 space-y-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Catecismo</h3>
              <p className="text-sm text-muted-foreground">
                Catecismo de la Iglesia Católica, citado con número de
                parágrafo cuando corresponde.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Sagrada Escritura</h3>
              <p className="text-sm text-muted-foreground">
                Biblia Latinoamericana y referencias cruzadas con la Nueva
                Vulgata.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <Church className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Magisterio</h3>
              <p className="text-sm text-muted-foreground">
                Concilios, encíclicas y documentos pontificios de la Iglesia
                Católica.
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" /> Cómo trabajamos
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Nuestra política editorial, el uso de IA y cómo verificamos el
            contenido está detallado en{" "}
            <Link to="/como-trabajamos" className="text-primary underline">
              Cómo trabajamos
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contacto</h2>
          <p className="text-muted-foreground">
            ¿Tenés una sugerencia o encontraste un error? Escribinos a{" "}
            <a
              href="mailto:hola@elrugido.com"
              className="text-primary underline"
            >
              hola@elrugido.com
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
