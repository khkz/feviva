import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Bot, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageSeo, orgPublisher } from "@/components/seo/PageSeo";

export default function ComoTrabajamos() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Cómo trabajamos — ElRugido",
    url: "https://elrugido.com/como-trabajamos",
    inLanguage: "es",
    about: {
      "@type": "Organization",
      name: "ElRugido",
      url: "https://elrugido.com",
      founder: { "@type": "Person", name: "Carlos Caro" },
    },
    publisher: orgPublisher(),
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Cómo trabajamos"
        description="Nuestra política editorial y de transparencia: fuentes que usamos, cómo verificamos el contenido y cómo empleamos la inteligencia artificial."
        path="/como-trabajamos"
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Cómo trabajamos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Política editorial y de transparencia de ElRugido.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Nuestras fuentes
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo el contenido doctrinal se apoya en fuentes oficiales de la
            Iglesia Católica:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">
                Catecismo de la Iglesia Católica
              </strong>{" "}
              — citado con número de parágrafo cuando corresponde.
            </li>
            <li>
              <strong className="text-foreground">Sagrada Escritura</strong> —
              Biblia Latinoamericana y referencias cruzadas con la Nueva
              Vulgata.
            </li>
            <li>
              <strong className="text-foreground">Magisterio</strong> —
              Concilios, encíclicas y documentos pontificios.
            </li>
            <li>
              <strong className="text-foreground">
                Fuentes católicas reconocidas
              </strong>{" "}
              — ACI Prensa, Vatican News y EWTN para datos hagiográficos e
              informativos, complementadas con Wikipedia cuando aporta
              contexto verificable.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Uso de inteligencia
            artificial
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Usamos modelos de lenguaje para acelerar la redacción de ciertos
            contenidos, pero{" "}
            <strong className="text-foreground">
              jamás para inventar doctrina
            </strong>
            . Algunos contenidos —como los{" "}
            <strong className="text-foreground">relatos de santos</strong>—
            son{" "}
            <em>dramatizaciones</em> creadas con IA y{" "}
            <strong className="text-foreground">
              siempre están etiquetados como "relato inspirado"
            </strong>{" "}
            junto con un enlace a la fuente en la que se basan.
          </p>
          <Card className="p-5 border-amber-500/30 bg-amber-500/5">
            <p className="text-sm text-muted-foreground">
              Los <strong className="text-foreground">datos verificables</strong>{" "}
              (fecha de fiesta, nacimiento, muerte, categoría, patronazgos) se
              muestran aparte del relato y se contrastan contra fuentes
              católicas reconocidas.
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Cómo verificamos
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            El calendario de santos fue{" "}
            <strong className="text-foreground">
              contrastado fecha por fecha
            </strong>{" "}
            contra fuentes católicas oficiales y contra Wikipedia en español.
            Cada ficha de santo muestra el estado de verificación y un enlace
            público a la fuente consultada, para que cualquier persona pueda
            comprobarlo por su cuenta.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cuando un contenido aún no está verificado, lo señalamos
            explícitamente en la propia ficha en lugar de esconderlo.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Tu
            retroalimentación
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Si detectás un error doctrinal, histórico o de fecha, te pedimos
            por favor que nos lo hagas saber. Lo revisamos y corregimos lo
            antes posible.
          </p>
          <p className="text-muted-foreground">
            Escribinos a{" "}
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
