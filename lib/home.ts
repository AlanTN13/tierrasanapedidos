import type { Product } from "@/types/catalog";
import type {
  HomeCategoryCard,
  HomeContent,
  HomeHeroConfig,
  ResolvedHomeHeroConfig,
  HomeSectionLink,
  RecipeHighlight,
  ResolvedRecipeHighlight,
} from "@/types/home";

const sectionLinks: HomeSectionLink[] = [
  { id: "categorias", label: "Categorias" },
  { id: "ideas", label: "Recetas" },
  { id: "productos", label: "Catalogo" },
];

const hero: HomeHeroConfig = {
  eyebrow: "Compra simple",
  title: "Elegí algo rico, sumalo al pedido y resolvelo fácil",
  description:
    "Una home pensada para descubrir básicos, antojos y combinaciones simples sin perder tiempo navegando de más.",
  searchPlaceholder: "Buscar granola, almendras, harinas, especias...",
  primaryCtaLabel: "Explorar categorías",
  secondaryCtaLabel: "Ver catálogo",
  heroSteps: [
    { number: "1", label: "Elegí una idea o buscá directo" },
    { number: "2", label: "Sumá productos a tu ritmo" },
    { number: "3", label: "Pedí por WhatsApp" },
  ],
  heroVisualItems: [
    {
      image: "/productos/mix-con-pasas-y-banana.png",
      title: "Desayunos con textura",
      detail: "Granolas, mixes y semillas para empezar por algo rico.",
      tone: "cream",
      size: "feature",
    },
    {
      image: "/productos/chia-premium.png",
      title: "Sumá un básico",
      detail: "Ingredientes simples que entran fácil en cualquier receta.",
      tone: "olive",
      size: "portrait",
    },
    {
      image: "/productos/arroz-yamani-integral.jpg",
      title: "Cocina simple",
      detail: "Bases nobles para almuerzos, snacks y meriendas.",
      tone: "sand",
      size: "compact",
    },
  ],
};

const categoryCards: HomeCategoryCard[] = [
  {
    category: "Frutos secos y snacks",
    title: "Frutos secos y snacks",
    image: "/productos/mix-con-avellanas.png",
  },
  {
    category: "Semillas",
    title: "Semillas",
    image: "/productos/mix-de-semillas.png",
  },
  {
    category: "Harinas",
    title: "Harinas",
    image: "/productos/harina-integral.png",
  },
  {
    category: "Cereales",
    title: "Desayunos y cereales",
    image: "/productos/granola-natural.png",
  },
  {
    category: "Especias",
    title: "Especias",
    image: "/productos/pimenton-ahumado.png",
  },
  {
    category: "Arroz y Gourmet",
    title: "Arroz y gourmet",
    image: "/productos/arroz-yamani-integral.jpg",
  },
  {
    category: "Reposteria",
    title: "Reposteria",
    image: "/productos/cacao-amargo-alcalino.png",
  },
  {
    category: "Legumbres",
    title: "Legumbres",
    image: "/productos/garbanzos.png",
  },
];

const recipeHighlights: RecipeHighlight[] = [
  {
    slug: "pan-integral-casero",
    title: "Pan integral casero",
    shortDescription: "Un pan simple, húmedo y sin amasado para desayunos, tostadas o para acompañar comidas.",
    longDescription:
      "Una receta rendidora para tener pan casero con ingredientes nobles y poca complicación. Va muy bien para quienes quieren sumar harinas integrales y semillas a la rutina sin pasar horas en la cocina.",
    heroImage: "/recetas/pan-integral.png",
    targetCategory: "Harinas",
    prepLabel: "40 min de horno",
    servingsLabel: "1 budinera",
    ingredients: [
      "400 g de harina integral",
      "100 g de harina 0000",
      "600 ml de agua tibia",
      "1 sobre de levadura",
      "Semillas a gusto",
      "1 cdita de sal",
      "1 cdita de aceite",
      "1 cda de miel (opcional)",
    ],
    steps: [
      "Mezclá la levadura con el agua tibia y dejala reposar unos minutos hasta que haga espuma.",
      "Colocá todos los ingredientes secos en un bowl grande.",
      "Agregá el líquido con la levadura y mezclá todo bien. No hace falta amasar.",
      "Pasá la mezcla a una budinera.",
      "Llevalo al horno durante aproximadamente 40 minutos.",
    ],
    productIds: ["harina-integral", "mix-de-semillas", "miel-liquida-beepure"],
  },
  {
    slug: "alfajorcitos-fit",
    title: "Alfajorcitos fit",
    shortDescription: "Una opción dulce y casera con cacao, relleno cremoso y porciones chicas para tener a mano.",
    longDescription:
      "Estos alfajorcitos son ideales para una merienda distinta o para sumar una receta casera al mostrador de ideas. La masa sale rápido y el relleno les da ese toque postre sin volverse pesado.",
    heroImage: "/recetas/alfajorcitos-fit.png",
    targetCategory: "Reposteria",
    prepLabel: "10 min de horno",
    servingsLabel: "4 porciones",
    ingredients: [
      "1 huevo",
      "50 g de harina de avena",
      "20 g de harina integral",
      "10 g de cacao amargo",
      "1 cda de edulcorante",
      "1 cdita de polvo de hornear",
      "1 cdita de esencia de vainilla",
      "30 g de leche en polvo descremada",
      "3 cditas de jugo de limón",
      "Ralladura de limón",
      "3 cditas de agua",
      "1 cdita de edulcorante",
    ],
    steps: [
      "Mezclá los ingredientes de la masa hasta formar una pasta.",
      "Hacé bolitas y aplastalas, o estirá y cortá para que queden más prolijos.",
      "Llevalos a horno precalentado durante 10 minutos.",
      "Para el relleno, mezclá todos los ingredientes hasta lograr una crema.",
      "Rellená con ayuda de una manga, armá los alfajorcitos y presioná suavemente.",
      "Guardalos en heladera si querés que queden más firmes.",
    ],
    productIds: ["avena-instantanea", "harina-integral", "cacao-amargo-alcalino", "polvo-de-hornear"],
  },
  {
    slug: "quinoa-inflada-con-chocolate",
    title: "Quinoa inflada con chocolate",
    shortDescription: "Bocaditos crocantes de chocolate para una colación rápida o un antojo dulce.",
    longDescription:
      "Una receta muy simple para transformar dos ingredientes en un snack vistoso y rendidor. Funciona perfecto para sumar una idea dulce que tenga mucha relación con los productos del catálogo.",
    heroImage: "/recetas/quinoa-con-chocolate.jpg",
    targetCategory: "Cereales",
    prepLabel: "30-60 min de frío",
    servingsLabel: "Varios bocaditos",
    ingredients: [
      "100 g de quinoa inflada",
      "150 g de chocolate semiamargo o 70% cacao",
    ],
    steps: [
      "Derretí el chocolate a baño María o en microondas en intervalos cortos.",
      "Incorporá la quinoa inflada y revolvé bien para que quede cubierta de chocolate.",
      "Con una cuchara, formá pequeños montoncitos sobre una bandeja con papel manteca.",
      "Llevalos a la heladera durante 30 a 60 minutos hasta que el chocolate endurezca.",
      "Serví y conservá en un recipiente hermético.",
    ],
    productIds: ["quinoa-inflada", "cacao-amargo-alcalino"],
  },
];

function resolveRecipes(products: Product[]): ResolvedRecipeHighlight[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return recipeHighlights.map((highlight) => ({
    ...highlight,
    products: highlight.productIds
      .map((productId) => productMap.get(productId))
      .filter((product): product is Product => Boolean(product)),
  }));
}

function resolveHero(): ResolvedHomeHeroConfig {
  return hero;
}

export function getHomeContent(products: Product[]): HomeContent {
  return {
    sectionLinks,
    hero: resolveHero(),
    categoryCards,
    recipeHighlights: resolveRecipes(products),
  };
}

export function getRecipeHighlights(products: Product[]) {
  return resolveRecipes(products);
}

export function getRecipeBySlug(products: Product[], slug: string) {
  return resolveRecipes(products).find((recipe) => recipe.slug === slug) ?? null;
}
