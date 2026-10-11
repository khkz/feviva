import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section className="w-full max-w-xl text-center" aria-labelledby="not-found-title">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-card shadow-soft">
          <span className="font-heading text-2xl font-bold text-gold-ink" aria-hidden="true">404</span>
        </div>
        <h1 id="not-found-title" className="text-3xl font-bold text-foreground sm:text-4xl">
          Esta página no está disponible
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">
          Puede que el enlace haya cambiado o que la página ya no exista. Puedes volver al inicio y continuar desde allí.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/">
              <Home aria-hidden="true" />
              Ir al inicio
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft aria-hidden="true" />
            Volver atrás
          </Button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
