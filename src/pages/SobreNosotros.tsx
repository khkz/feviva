import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SobreNosotros() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ElRugido",
    url: "https://elrugido.com",
    logo: "https://elrugido.com/logo-elrugido.png",
    foundingDate: "2025",
    founder: { "@type": "Person", name: "Carlos Caro" },
    description:
      "ElRugido es una iniciativa de fieles laicos católicos. Su contenido se fundamenta en el Catecismo de la Iglesia Católica, la Sagrada Escritura y el Magisterio.",
    sameAs: ["https://elrugido.com"],
    knowsAbout: [
      "Apologética Católica",
      "Magisterio de la Iglesia",
      "Sagrada Escritura",
      "Catecismo de la Iglesia Católica",
      "Hagiografía",
      "Oración",
    ],
    publishingPrinciples: "https://elrugido.com/como-trabajamos",
    editorialPolicy:
      "Todo el contenido doctrinal cita literalmente el Magisterio, la Sagrada Escritura o el Catecismo. No se inventa doctrina.",
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sobre Nosotros — ElRugido, formación católica fiel</title>
        <meta
          name="description"
          content="ElRugido es una plataforma católica de formación espiritual fundada en 2025. Citamos literalmente el Magisterio, la Biblia y el Catecismo. Cero invención doctrinal."
        />
        <link rel="canonical" href="https://elrugido.com/sobre-nosotros" />
        <meta property="og:title" content="Sobre Nosotros — ElRugido" />
        <meta
          property="og:description"
          content="Misión, principios editoriales y compromiso con la fidelidad doctrinal de ElRugido."
        />
        <meta property="og:url" content="https://elrugido.com/sobre-nosotros" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
      </Helmet>

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
            Sobre ElRugido
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma católica para prepararnos a dar razón de nuestra
            esperanza, con verdad y caridad.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Nuestra misión</h2>
          <p className="text-muted-foreground leading-relaxed">
            Inspirados en{" "}
            <strong className="text-foreground">1 Pedro 3:15</strong> —
            "Preparados siempre para dar razón de vuestra esperanza" — ofrecemos
            herramientas digitales fieles a la Iglesia Católica para crecer en
            oración, conocimiento y caridad. No buscamos retención por
            retención: queremos que cada minuto en la app empuje a una vida
            más humana, más oracional y más libre de las ansiedades del mundo
            digital.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Principios editoriales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5 space-y-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Fidelidad doctrinal</h3>
              <p className="text-sm text-muted-foreground">
                Cero invención teológica. Citamos literalmente la Biblia,
                el Catecismo y el Magisterio.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Revisión humana</h3>
              <p className="text-sm text-muted-foreground">
                Todo contenido generado con asistencia de IA es revisado por
                un editor humano antes de marcarse como verificado.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <Heart className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Caridad antes que victoria</h3>
              <p className="text-sm text-muted-foreground">
                En apologética la verdad sin amor es crueldad. Nuestro coach
                penaliza respuestas hirientes aunque sean correctas.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Humanismo digital</h3>
              <p className="text-sm text-muted-foreground">
                Sin scroll infinito, sin alarmismo, sin ansiedad inducida.
                La tecnología al servicio de la vida real.
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Fuentes que usamos</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Sagrada Escritura</strong> —
              Biblia Latinoamericana y referencias cruzadas con la Nueva
              Vulgata.
            </li>
            <li>
              <strong className="text-foreground">
                Catecismo de la Iglesia Católica
              </strong>{" "}
              — citado con número de parágrafo cuando es relevante.
            </li>
            <li>
              <strong className="text-foreground">Magisterio</strong> —
              Concilios, encíclicas y documentos pontificios.
            </li>
            <li>
              <strong className="text-foreground">Hagiografía</strong> —
              Biografías de santos basadas en fuentes históricas (Wikipedia
              enciclopédica y obras hagiográficas tradicionales), revisadas
              antes de publicar.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Política sobre IA</h2>
          <p className="text-muted-foreground leading-relaxed">
            Usamos modelos de lenguaje para acelerar la redacción, pero{" "}
            <strong className="text-foreground">
              jamás para inventar doctrina
            </strong>
            . Las narraciones reflexivas pueden incluir personajes
            ilustrativos; siempre que esto ocurra el contenido se etiqueta
            como reflexión pastoral, no como hecho histórico. Cuando un
            contenido aún no ha sido verificado humanamente, lo marcamos
            como <em>en revisión</em> dentro de la plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contacto</h2>
          <p className="text-muted-foreground">
            ¿Encontraste un error doctrinal o histórico? Escríbenos a{" "}
            <a
              href="mailto:contacto@elrugido.com"
              className="text-primary underline"
            >
              contacto@elrugido.com
            </a>{" "}
            y lo corregiremos lo antes posible.
          </p>
        </section>
      </main>
    </div>
  );
}
