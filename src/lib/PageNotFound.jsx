import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-muted-foreground/40">404</h1>
            <div className="h-0.5 w-16 bg-border mx-auto"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium">Page introuvable</h2>
            <p className="text-muted-foreground leading-relaxed">
              La page <span className="font-medium">« {pageName} »</span> n'existe pas dans cette application.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}