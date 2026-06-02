import { CATEGORY_CONFIG, getFeaturedProducts } from "@/lib/catalog";
import type { Product } from "@/types/catalog";
import type {
  HomeCategoryCard,
  HomeContent,
  HomeFeaturedShelf,
  HomeHeroConfig,
  ResolvedHomeHeroConfig,
  HomeSectionLink,
  RecipeHighlight,
  ResolvedRecipeHighlight,
} from "@/types/home";

const sectionLinks: HomeSectionLink[] = [
  { id: "categorias", label: "Nuestras categorias" },
  { id: "productos", label: "Catalogo" },
  { id: "ideas", label: "Recetas" },
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

const categoryCards: HomeCategoryCard[] = CATEGORY_CONFIG.map((entry) => ({
  category: entry.category,
  title: entry.title,
  image: entry.image,
}));

const recipeHighlights: RecipeHighlight[] = [
  {
    slug: "cookies-de-mantequilla-de-mani",
    title: "Cookies de mantequilla de maní",
    shortDescription: "Galletitas simples, suaves y bien rendidoras con mantequilla de maní y chips de chocolate.",
    longDescription:
      "Una receta ideal para resolver una merienda casera con pocos ingredientes, buena textura, mucho sabor a maní y un plus de chocolate. Funciona perfecto como receta principal porque es simple, tentadora y conecta directo con productos del catálogo.",
    heroImage: "/recetas/cookies-mantequilla-mani.png",
    targetCategory: "Dulces y untables",
    prepLabel: "12 a 15 min de horno",
    servingsLabel: "Varias cookies",
    ingredients: [
      "1 huevo grande",
      "1 taza de mantequilla de maní suave y natural sin azúcar",
      "2 cucharadas de endulzante",
      "1/2 taza de chips de chocolate negro",
    ],
    steps: [
      "En un bol, mezclá el huevo, la mantequilla de maní y el endulzante hasta que queden bien integrados.",
      "Sumá los chips de chocolate y mezclá suavemente para distribuirlos bien.",
      "Con las manos, formá una bola con 1 cucharada de masa y colocala en una bandeja para horno.",
      "Repetí el procedimiento con el resto de la masa.",
      "Con un tenedor, presioná la parte superior de cada bola en direcciones opuestas para crear un patrón entrecruzado.",
      "Horneá de 12 a 15 minutos, hasta que se doren.",
      "Dejalas enfriar unos 5 minutos en la bandeja antes de pasarlas a una rejilla.",
      "Guardalas en un recipiente hermético a temperatura ambiente hasta por 5 días.",
    ],
    productIds: ["pasta-mani-beepure", "stevia-hileret-50-sobres", "chips-de-chocolate-negro"],
  },
  {
    slug: "pan-integral-casero",
    title: "Pan integral casero",
    shortDescription: "Un pan simple, húmedo y sin amasado para desayunos, tostadas o para acompañar comidas.",
    longDescription:
      "Una receta rendidora para tener pan casero con ingredientes nobles y poca complicación. Va muy bien para quienes quieren sumar harinas integrales y semillas a la rutina sin pasar horas en la cocina.",
    heroImage: "/recetas/pan-integral.png",
    targetCategory: "Harinas y premezclas",
    prepLabel: "40 min de horno",
    servingsLabel: "1 budinera",
    ingredients: [
      "400 g de harina integral",
      "100 g de harina 0000",
      "600 ml de agua tibia",
      "1 sobre de levadura",
      "Semillas a gusto",
      "1 cdita de sal",
      "1 cdita de aceite de oliva",
      "1 cda de miel (opcional)",
    ],
    steps: [
      "Mezclá la levadura con el agua tibia y dejala reposar unos minutos hasta que haga espuma.",
      "Colocá todos los ingredientes secos en un bowl grande.",
      "Agregá el líquido con la levadura y mezclá todo bien. No hace falta amasar.",
      "Pasá la mezcla a una budinera.",
      "Llevalo al horno durante aproximadamente 40 minutos.",
    ],
    productIds: ["harina-integral", "mix-de-semillas", "aceite-de-oliva-extra-virgen", "miel-liquida-beepure"],
  },
  {
    slug: "trufas-fit",
    title: "Trufas fit",
    shortDescription: "Trufas rápidas, intensas en cacao y con coco rallado para resolver un antojo dulce sin horno.",
    longDescription:
      "Estas trufas son una gran opción para sumar una receta dulce, simple y vistosa. Se preparan en pocos pasos, van directo a la heladera y usan ingredientes muy presentes en la tienda.",
    heroImage: "/recetas/trufas-fit.webp",
    targetCategory: "Reposteria y endulzantes",
    prepLabel: "30 min de frío",
    servingsLabel: "Varias trufas",
    ingredients: [
      "3 cucharadas de pasta de maní",
      "1 taza de cacao amargo",
      "1/2 taza de harina de almendras",
      "1 taza de coco rallado",
      "4 cucharadas de azúcar mascabo o edulcorante",
    ],
    steps: [
      "Mezclá todos los ingredientes hasta formar una pasta.",
      "Hacé bolitas del tamaño que más te guste.",
      "Rebozalas en coco rallado.",
      "Dejalas en la heladera por 30 minutos y listo.",
    ],
    productIds: [
      "pasta-mani-beepure",
      "cacao-amargo-alcalino",
      "harina-de-almendras",
      "coco-rallado",
      "azucar-mascabo",
      "stevia-hileret-50-sobres",
    ],
  },
  {
    slug: "alfajorcitos-fit",
    title: "Alfajorcitos fit",
    shortDescription: "Una opción dulce y casera con cacao, relleno cremoso y porciones chicas para tener a mano.",
    longDescription:
      "Estos alfajorcitos son ideales para una merienda distinta o para sumar una receta casera al mostrador de ideas. La masa sale rápido y el relleno les da ese toque postre sin volverse pesado.",
    heroImage: "/recetas/alfajorcitos-fit.png",
    targetCategory: "Reposteria y endulzantes",
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
    productIds: [
      "avena-instantanea",
      "harina-integral",
      "cacao-amargo-alcalino",
      "polvo-de-hornear",
      "stevia-hileret-50-sobres",
    ],
  },
  {
    slug: "quinoa-inflada-con-chocolate",
    title: "Quinoa inflada con chocolate",
    shortDescription: "Bocaditos crocantes de chocolate para una colación rápida o un antojo dulce.",
    longDescription:
      "Una receta muy simple para transformar dos ingredientes en un snack vistoso y rendidor. Funciona perfecto para sumar una idea dulce que tenga mucha relación con los productos del catálogo.",
    heroImage: "/recetas/quinoa-con-chocolate.jpg",
    targetCategory: "Cereales y granolas",
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
    productIds: ["quinoa-inflada", "chips-de-chocolate-negro"],
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

function resolveFeaturedShelf(products: Product[]): HomeFeaturedShelf {
  return {
    title: "Elegidos para arrancar rápido",
    description:
      "Una selección corta para comprar algo rico sin tener que entrar de lleno al catálogo completo.",
    products: getFeaturedProducts(products).slice(0, 5),
  };
}

export function getHomeContent(products: Product[]): HomeContent {
  return {
    sectionLinks,
    hero: resolveHero(),
    categoryCards,
    featuredShelf: resolveFeaturedShelf(products),
    recipeHighlights: resolveRecipes(products),
  };
}

export function getRecipeHighlights(products: Product[]) {
  return resolveRecipes(products);
}

export function getRecipeBySlug(products: Product[], slug: string) {
  return resolveRecipes(products).find((recipe) => recipe.slug === slug) ?? null;
}
