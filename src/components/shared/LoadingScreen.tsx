import { AsyncState } from "@/components/shared/AsyncState";

const LoadingScreen = () => (
  <main className="flex min-h-screen items-center justify-center bg-background">
    <AsyncState
      kind="loading"
      title="Preparando tu experiencia"
      description="Estamos reuniendo el contenido para ti."
      className="min-h-64"
    />
  </main>
);

export default LoadingScreen;
