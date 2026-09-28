import { useState } from 'react';
import { ChevronDown, BookOpen, HelpCircle, Mail, Anchor } from 'lucide-react';

const GUIDE = [
  [`Tableau de bord`, `Vue d'ensemble : échéances de la semaine, messages récents et état de la flotte. Accédez rapidement à la rédaction d'un nouveau message ou à l'historique.`],
  [`Rédiger un message`, `Choisissez un type de compte-rendu (hebdomadaire, mouvement, mission). Les champs se remplissent automatiquement avec les informations de votre unité et de votre flotte. L'aperçu se met à jour en direct.`],
  [`Historique`, `Retrouvez tous les messages enregistrés. Filtrez par type, exportez en .txt (un par un ou dans un dossier), ou ouvrez un message pour l'exporter en PDF, le copier ou le marquer comme envoyé.`],
  [`Flotte`, `Gérez vos bâtiments (nom, code, état, VB, situation). Ces données pré-remplissent les CRHSBE et autres rapports.`],
  [`Unité (Paramètres)`, `Renseignez le nom de l'unité, le commandant, les destinataires, le suffixe de référence. Configurez l'échéance hebdomadaire, le cachet officiel (taille et position), et exportez une sauvegarde JSON complète.`],
];

const FAQ = [
  [`Où sont stockées mes données ?`, `Toutes les données (messages, flotte, paramètres, cachet) restent sur votre appareil dans une base locale (IndexedDB). Aucune donnée n'est envoyée vers un serveur.`],
  [`Comment exporter un message en PDF ?`, `Ouvrez le message puis appuyez sur « PDF ». Sur mobile, le fichier est proposé au partage (enregistrer, envoyer, imprimer). Sur ordinateur, il est téléchargé.`],
  [`Puis-je utiliser l'application hors-ligne ?`, `Oui. L'application fonctionne intégralement sans connexion internet une fois installée.`],
  [`Comment changer le numéro de départ des messages ?`, `Dans Paramètres → Unité, modifiez le champ « Prochain numéro NR ».`],
  [`Comment sauvegarder toutes mes données ?`, `Paramètres → Sauvegarde locale → « Exporter la sauvegarde ». Un fichier JSON contenant messages, flotte et paramètres est téléchargé.`],
];

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="font-heading text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Item({ title, body, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 text-left">
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{body}</p>}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <Anchor className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading text-4xl tracking-tight">Aide &amp; Support</h1>
          <p className="text-muted-foreground text-sm mt-1">Guide, questions fréquentes et contact.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <Section icon={BookOpen} title="Guide d'utilisation">
          <div className="divide-y divide-border">
            {GUIDE.map(([t, b], i) => <Item key={t} title={t} body={b} defaultOpen={i === 0} />)}
          </div>
        </Section>

        <Section icon={HelpCircle} title="Questions fréquentes">
          <div className="divide-y divide-border">
            {FAQ.map(([t, b]) => <Item key={t} title={t} body={b} />)}
          </div>
        </Section>

        <Section icon={Mail} title="Contact et support">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pour toute question, suggestion ou signalement de dysfonctionnement, contactez le développeur :
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <div><span className="text-muted-foreground">Email : </span><a href="mailto:disac.support@dnfd.mil" className="text-primary underline">disac.support@dnfd.mil</a></div>
            <div><span className="text-muted-foreground">Téléphone : </span>+261 32 00 000 00</div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Application DISAC — Registre des messages et comptes-rendus opérationnels du Détachement Naval.
          </p>
        </Section>
      </div>

      <footer className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 LTV RAKOTONIRINA Diary Androsoa. Tous droits réservés.
      </footer>
    </div>
  );
}