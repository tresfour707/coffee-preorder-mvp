export type ProductMediaDefinition = {
  src: string;
  alt: string;
  objectPosition?: string;
};

const productMediaByName: Record<string, ProductMediaDefinition> = {
  "Шашлычок куриный с картофелем": {
    src: "/product-images/mains/chicken-skewer-potatoes-v2.png",
    alt: "Шашлычок куриный с картофелем на белой тарелке",
  },
  "Пожарская котлета с пюре": {
    src: "/product-images/mains/pozharsky-cutlet-mashed-potatoes-v2.png",
    alt: "Пожарская котлета с пюре на белой тарелке",
  },
  "Паста с песто и курицей": {
    src: "/product-images/mains/pesto-chicken-pasta-v2.png",
    alt: "Паста с песто и курицей на белой тарелке",
  },
  "Шницель куриный с грибами, пюре и сыром": {
    src: "/product-images/mains/chicken-schnitzel-mushrooms-puree-cheese-v2.png",
    alt: "Шницель куриный с грибами, пюре и сыром на белой тарелке",
  },
  "Жареный рис с креветками": {
    src: "/product-images/mains/shrimp-fried-rice-v2.png",
    alt: "Жареный рис с креветками на белой тарелке",
  },
  "Жареный рис с курицей": {
    src: "/product-images/mains/chicken-fried-rice-v2.png",
    alt: "Жареный рис с курицей на белой тарелке",
  },
  "Жареная лапша с курицей": {
    src: "/product-images/mains/chicken-fried-noodles-v2.png",
    alt: "Жареная лапша с курицей на белой тарелке",
  },
  'Чиабатта "Цезарь"': {
    src: "/product-images/cold-snacks/chiabatta-caesar.png",
    alt: 'Чиабатта "Цезарь" в крафтовом лотке',
  },
  "Чиабатта с моцареллой и томатами": {
    src: "/product-images/cold-snacks/chiabatta-mozzarella-tomato.png",
    alt: "Чиабатта с моцареллой и томатами в крафтовом лотке",
  },
  'Ролл "Цезарь" с курицей': {
    src: "/product-images/cold-snacks/caesar-chicken-roll.png",
    alt: 'Ролл "Цезарь" с курицей',
  },
  'Ролл с лососем под соусом "Тартар"': {
    src: "/product-images/cold-snacks/salmon-tartar-roll.png",
    alt: 'Ролл с лососем под соусом "Тартар"',
  },
  "Круассан с ветчиной и сыром": {
    src: "/product-images/cold-snacks/ham-cheese-croissant.png",
    alt: "Круассан с ветчиной и сыром",
  },
  "Круассан со слабосоленым лососем": {
    src: "/product-images/cold-snacks/salmon-croissant.png",
    alt: "Круассан со слабосоленым лососем",
  },
  "Сэндвич с индейкой": {
    src: "/product-images/cold-snacks/turkey-sandwich.png",
    alt: "Сэндвич с индейкой",
  },
  "Сэндвич с курицей по-тайски": {
    src: "/product-images/cold-snacks/thai-chicken-sandwich.png",
    alt: "Сэндвич с курицей по-тайски",
  },
  "Спринг-ролл с креветками": {
    src: "/product-images/cold-snacks/shrimp-spring-roll.png",
    alt: "Спринг-ролл с креветками на белой тарелке",
  },
  'Салат "Цезарь" с цыпленком': {
    src: "/product-images/cold-snacks/chicken-caesar-salad.png",
    alt: 'Салат "Цезарь" с цыпленком',
  },
  'Салат "Цезарь" с креветками': {
    src: "/product-images/cold-snacks/shrimp-caesar-salad.png",
    alt: 'Салат "Цезарь" с креветками',
  },
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
  "Ватрушка с творогом": {
    src: "/product-images/desserts/cottage-cheese-vatrushka.png",
    alt: "Ватрушка с творогом",
  },
  "Дениш с малиной": {
    src: "/product-images/desserts/raspberry-danish.png",
    alt: "Дениш с малиной",
  },
  "Ириска с гималайской солью": {
    src: "/product-images/desserts/himalayan-salt-toffee.png",
    alt: "Ириска с гималайской солью",
  },
  "Ириска сливочная": {
    src: "/product-images/desserts/creamy-toffee.png",
    alt: "Ириска сливочная",
  },
  "Кекс лимонный": {
    src: "/product-images/desserts/lemon-cake.png",
    alt: "Кекс лимонный",
  },
  "Кекс шоколадный": {
    src: "/product-images/desserts/chocolate-cake.png",
    alt: "Кекс шоколадный",
  },
  "Классический круассан": {
    src: "/product-images/desserts/classic-croissant.png",
    alt: "Классический круассан",
  },
  "Круассан с лавандой и черникой": {
    src: "/product-images/desserts/lavender-blueberry-croissant.png",
    alt: "Круассан с лавандой и черникой",
  },
  "Кукис овсяный с изюмом": {
    src: "/product-images/desserts/oatmeal-raisin-cookie.png",
    alt: "Кукис овсяный с изюмом",
  },
  "Кукис с молочным шоколадом": {
    src: "/product-images/desserts/milk-chocolate-cookie.png",
    alt: "Кукис с молочным шоколадом",
  },
  "Кукис шоколадный с апельсином": {
    src: "/product-images/desserts/chocolate-orange-cookie.png",
    alt: "Кукис шоколадный с апельсином",
  },
  "Миндальный круассан": {
    src: "/product-images/desserts/almond-croissant.png",
    alt: "Миндальный круассан",
  },
  "Плетенка с маком": {
    src: "/product-images/desserts/poppy-seed-braid.png",
    alt: "Плетенка с маком",
  },
  'Пирожное "Медовик"': {
    src: "/product-images/desserts/honey-cake.png",
    alt: 'Пирожное "Медовик"',
  },
  "Пирожное Наполеон": {
    src: "/product-images/desserts/napoleon-cake.png",
    alt: "Пирожное Наполеон",
  },
  "Пирожное Шу": {
    src: "/product-images/desserts/choux-pastry.png",
    alt: "Пирожное Шу",
  },
  "Синнабон": {
    src: "/product-images/desserts/cinnabon.png",
    alt: "Синнабон",
  },
  "Сочник с творогом": {
    src: "/product-images/desserts/cottage-cheese-sochnik.png",
    alt: "Сочник с творогом",
  },
  "Тирамису": {
    src: "/product-images/desserts/tiramisu.png",
    alt: "Тирамису",
  },
  "Трубочка со сгущёнкой": {
    src: "/product-images/desserts/condensed-milk-tube.png",
    alt: "Трубочка со сгущёнкой",
  },
  "Улитка с маком": {
    src: "/product-images/desserts/poppy-seed-snail.png",
    alt: "Улитка с маком",
  },
  "Улитка с изюмом": {
    src: "/product-images/desserts/raisin-snail.png",
    alt: "Улитка с изюмом",
  },
  "Улитка с корицей и карамелью": {
    src: "/product-images/desserts/cinnamon-caramel-snail.png",
    alt: "Улитка с корицей и карамелью",
  },
  'Чиа-пудинг "Кокос-малина"': {
    src: "/product-images/desserts/coconut-raspberry-chia-pudding.png",
    alt: 'Чиа-пудинг "Кокос-малина"',
  },
  'Чиа-пудинг "Манго-кокос"': {
    src: "/product-images/desserts/mango-coconut-chia-pudding.png",
    alt: 'Чиа-пудинг "Манго-кокос"',
  },
  "Шоколадный круассан": {
    src: "/product-images/desserts/chocolate-croissant.png",
    alt: "Шоколадный круассан",
  },
};

export function getProductMedia(name: string) {
  return productMediaByName[name] ?? null;
}
