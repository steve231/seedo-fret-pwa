// Brouillon fonctionnel — à faire valider par un juriste avant tout usage
// commercial réel. Incrémenter CONTRACT_VERSION à chaque changement de
// fond : les gestionnaires déjà actifs ne sont pas re-sollicités
// automatiquement, mais ça garde une trace de quelle version chacun a
// acceptée (fleet_manager_profiles.contract_version).
export const CONTRACT_VERSION = "draft-1";

export const CONTRACT_TITLE = "Contrat de partenariat — Gestionnaire de flotte SEEDO Fret";

export const CONTRACT_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "1. Objet",
    body:
      "Le présent contrat définit les conditions dans lesquelles SEEDO FRET " +
      "autorise le Partenaire à enregistrer et superviser des transporteurs " +
      "sur la plateforme SEEDO Fret, en tant que gestionnaire de flotte.",
  },
  {
    heading: "2. Responsabilités du Partenaire",
    body:
      "Le Partenaire est seul responsable de l'identité, de l'aptitude et de " +
      "la conformité (permis de conduire, documents du véhicule, assurance) " +
      "de chaque transporteur qu'il enregistre. Il s'engage à superviser " +
      "activement leurs courses et à relayer fidèlement, auprès de SEEDO " +
      "Fret, l'avancement de chaque course d'après les retours du " +
      "transporteur sur le terrain (téléphone, WhatsApp ou tout autre " +
      "moyen de contact direct).",
  },
  {
    heading: "3. Validation par SEEDO Fret",
    body:
      "L'accès du Partenaire aux fonctionnalités de gestion de flotte est " +
      "soumis à la validation de son dossier (pièce d'identité, RCCM pour " +
      "les comptes entreprise) par l'équipe SEEDO Fret. SEEDO Fret se " +
      "réserve le droit de suspendre ou de révoquer cet accès en cas de " +
      "manquement aux obligations du présent contrat.",
  },
  {
    heading: "4. Rémunération",
    body:
      "La rémunération du Partenaire sur les courses réalisées par les " +
      "transporteurs qu'il gère est définie selon la grille tarifaire en " +
      "vigueur sur la plateforme, communiquée séparément et pouvant " +
      "évoluer avec préavis raisonnable.",
  },
  {
    heading: "5. Confidentialité",
    body:
      "Le Partenaire s'engage à ne pas divulguer à des tiers les " +
      "informations des expéditeurs, transporteurs ou commandes auxquelles " +
      "il a accès dans le cadre de ce partenariat, au-delà de ce qui est " +
      "strictement nécessaire à l'exécution des courses.",
  },
  {
    heading: "6. Durée et résiliation",
    body:
      "Ce partenariat est conclu pour une durée indéterminée. Chaque " +
      "partie peut y mettre fin à tout moment, avec un préavis écrit, sans " +
      "préjudice des courses déjà engagées au moment de la résiliation.",
  },
  {
    heading: "7. Droit applicable",
    body: "Le présent contrat est régi par le droit béninois.",
  },
];
