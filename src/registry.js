// ============================================================
// BERTHO AI — OFFICIAL ECOSYSTEM REGISTRY
// Source officielle utilisée par Bertho AI
// ============================================================

export const BERTHO_REGISTRY = {

  identity: {

    name: "Bertho",

    meaning:
      "Bertho est à la fois le diminutif de Gilberto LEBIBI, fondateur de l'écosystème, et le nom désignant l'ensemble de l'écosystème numérique construit autour de sa vision.",

    founder: {
      name: "Gilberto LEBIBI",
      known_as: "Bertho"
    }

  },


  ecosystem: {

    name: "Bertho",

    description:
      "Un écosystème numérique développé pour contribuer à l'innovation, simplifier certains usages technologiques et accompagner l'évolution numérique dans plusieurs domaines."

  },


  products: {

    berthoplay: {

      name: "BerthoPlay",

      official_url:
        "https://berthoplay.pages.dev",

      status: "active",

      description:
        "Plateforme de divertissement, de réjouissance, d'apprentissage et de réseau social.",

      role:
        "BerthoPlay constitue l'espace orienté vers les expériences interactives, le divertissement, les jeux et les interactions entre utilisateurs."

    },


    berthoweb: {

      name: "BerthoWeb",

      official_url:
        "https://bertho-web.pages.dev",

      status: "active",

      description:
        "Site officiel de l'écosystème Bertho.",

      role:
        "BerthoWeb accompagne les entreprises dans leur transformation digitale."

    },


    berthopay: {

      name: "BerthoPay",

      official_url:
        "https://berthopay.pages.dev",

      status: "development",

      description:
        "Passerelle de paiement destinée à faire partie de l'écosystème Bertho.",

      role:
        "BerthoPay vise à fournir une infrastructure de paiement au sein de l'écosystème.",

      availability:
        "En développement. Les fonctionnalités non officiellement publiées ne doivent pas être présentées comme disponibles."

    },


    berthomarketplace: {

      name: "Bertho Marketplace",

      official_url:
        "https://bertho-markeplace.pages.dev",

      status: "development",

      description:
        "Espace de commerce destiné à réunir des commerçants du monde entier.",

      role:
        "La vision du projet cible jusqu'à 180 pays et prévoit 14 langues, incluant notamment le lingala, le swahili et le bambara, ainsi que des langues internationales.",

      payments:
        "Le projet prévoit la prise en charge de moyens de paiement nationaux et internationaux.",

      availability:
        "En développement. Les fonctionnalités prévues ne doivent pas être présentées comme déjà disponibles."

    },


    berthodocs: {

      name: "Bertho Docs",

      official_url:
        "https://bertho-docs.pages.dev",

      status: "development",

      description:
        "Espace destiné à regrouper les diagnostics et documents publiés par l'écosystème Bertho.",

      role:
        "Bertho Docs sert d'espace documentaire pour les contenus et diagnostics publiés par l'écosystème.",

      availability:
        "En développement."

    },


    berthoai: {

      name: "Bertho AI",

      official_url: null,

      status: "active",

      description:
        "Intelligence artificielle centrale de l'écosystème Bertho.",

      role:
        "Bertho AI est conçue comme une intelligence centrale pouvant accompagner les utilisateurs, expliquer les services de l'écosystème, enseigner, assister dans des projets techniques, utiliser des outils et évoluer progressivement vers un système indépendant.",

      availability:
        "Système en développement continu."
    }

  }

};


// ============================================================
// HELPERS
// ============================================================

export function getProduct(
  productId
) {

  if (!productId) {
    return null;
  }

  return (
    BERTHO_REGISTRY.products[
      productId
    ] || null
  );

}


export function getProducts() {

  return Object.entries(
    BERTHO_REGISTRY.products
  ).map(
    ([id, product]) => ({
      id,
      ...product
    })
  );

}


export function getEcosystemSummary() {

  return {

    name:
      BERTHO_REGISTRY.ecosystem.name,

    description:
      BERTHO_REGISTRY.ecosystem.description,

    founder:
      BERTHO_REGISTRY.identity.founder,

    products:
      getProducts()

  };

}