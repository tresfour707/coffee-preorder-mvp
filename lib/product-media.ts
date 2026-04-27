export type ProductMediaDefinition = {
  src: string;
  alt: string;
  objectPosition?: string;
};

const productMediaByName: Record<string, ProductMediaDefinition> = {
  "Сырники со сметаной": {
    src: "/product-images/breakfast/syrniki-so-smetanoy.png",
    alt: "Сырники со сметаной на белой тарелке",
  },
  "Блины с творогом и бананом": {
    src: "/product-images/breakfast/bliny-s-tvorogom-i-bananom.png",
    alt: "Блины с творогом и бананом на белой тарелке",
  },
  "Блины с ветчиной и сыром": {
    src: "/product-images/breakfast/bliny-s-vetchinoy-i-syrom.png",
    alt: "Блины с ветчиной и сыром на белой тарелке",
  },
  "Блины с мясом и сметаной": {
    src: "/product-images/breakfast/bliny-s-myasom-i-smetanoy.png",
    alt: "Блины с мясом и сметаной на белой тарелке",
  },
  "Блины с курицей и грибами": {
    src: "/product-images/breakfast/bliny-s-kuritsey-i-gribami.png",
    alt: "Блины с курицей и грибами на белой тарелке",
  },
  "Азиатский завтрак с креветками": {
    src: "/product-images/breakfast/aziatskiy-zavtrak-s-krevetkami.png",
    alt: "Азиатский завтрак с креветками в белой тарелке",
  },
  "Английский завтрак с колбаской": {
    src: "/product-images/breakfast/angliyskiy-zavtrak-s-kolbaskoy.png",
    alt: "Английский завтрак с колбаской в белой тарелке",
  },
};

export function getProductMedia(name: string) {
  return productMediaByName[name] ?? null;
}
