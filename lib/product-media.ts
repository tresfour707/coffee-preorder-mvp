export type ProductMediaDefinition = {
  src: string;
  alt: string;
  objectPosition?: string;
};

const productMediaByName: Record<string, ProductMediaDefinition> = {
  "Капучино": {
    src: "/product-images/drinks/cappuccino.png",
    alt: "Капучино",
  },
  "Латте": {
    src: "/product-images/drinks/latte.png",
    alt: "Латте",
  },
  "Раф-кофе": {
    src: "/product-images/drinks/raf-coffee.png",
    alt: "Раф-кофе",
  },
  "Флэт Уайт": {
    src: "/product-images/drinks/flat-white.png",
    alt: "Флэт Уайт",
  },
  "Американо": {
    src: "/product-images/drinks/americano.png",
    alt: "Американо",
  },
  "Фильтр-кофе": {
    src: "/product-images/drinks/filter-coffee.png",
    alt: "Фильтр-кофе",
  },
  "Эспрессо": {
    src: "/product-images/drinks/espresso.png",
    alt: "Эспрессо",
  },
  "Какао": {
    src: "/product-images/drinks/cacao.png",
    alt: "Какао",
  },
  "Маття-латте": {
    src: "/product-images/drinks/matcha-latte.png",
    alt: "Маття-латте",
  },
  "Лимонад апельсин-фейхоа": {
    src: "/product-images/drinks/orange-feijoa-lemonade.png",
    alt: "Лимонад апельсин-фейхоа",
  },
  "Тоник вишня-базилик": {
    src: "/product-images/drinks/cherry-basil-tonic.png",
    alt: "Тоник вишня-базилик",
  },
  "Пряный улун с грейпфрутом": {
    src: "/product-images/drinks/oolong-grapefruit.png",
    alt: "Пряный улун с грейпфрутом",
  },
  "Матча карамельный попкорн": {
    src: "/product-images/drinks/matcha-caramel-popcorn.png",
    alt: "Матча карамельный попкорн",
  },
  "Капучино ром и ирландский крем": {
    src: "/product-images/drinks/cappuccino-rum-irish-cream.png",
    alt: "Капучино ром и ирландский крем",
  },
  "Мокко пряный маршмеллоу": {
    src: "/product-images/drinks/spicy-mocha-marshmallow.png",
    alt: "Мокко пряный маршмеллоу",
  },
  "Арахисовый Раф": {
    src: "/product-images/drinks/peanut-raf.png",
    alt: "Арахисовый Раф",
  },
  "Гранатовый Глинтвейн": {
    src: "/product-images/drinks/pomegranate-glintwein.png",
    alt: "Гранатовый Глинтвейн",
  },
  "Тыквенный Латте": {
    src: "/product-images/drinks/pumpkin-latte.png",
    alt: "Тыквенный Латте",
  },
  "Холодный какао re-feel": {
    src: "/product-images/drinks/cold-cacao-refeel.png",
    alt: "Холодный какао re-feel",
  },
  "Матча-латте re-feel": {
    src: "/product-images/drinks/matcha-refeel.png",
    alt: "Матча-латте re-feel",
  },
  "Грейпфрут-бузина": {
    src: "/product-images/drinks/grapefruit-elder.png",
    alt: "Грейпфрут-бузина",
  },
  "Грушевый чай": {
    src: "/product-images/drinks/pear-tea.png",
    alt: "Грушевый чай",
  },
  "Смородина-мята": {
    src: "/product-images/drinks/blackcurrant-mint.png",
    alt: "Смородина-мята",
  },
  "Облепиха-имбирь": {
    src: "/product-images/drinks/sea-buckthorn-ginger.png",
    alt: "Облепиха-имбирь",
  },
  "Клюква-можжевельник": {
    src: "/product-images/drinks/cranberry-juniper.png",
    alt: "Клюква-можжевельник",
  },
  "Ягодный микс": {
    src: "/product-images/drinks/berry-mix.png",
    alt: "Ягодный микс",
  },
  "Чай Ассам": {
    src: "/product-images/drinks/tea-assam.png",
    alt: "Чай Ассам",
  },
  "Чай Шу Пуэр": {
    src: "/product-images/drinks/tea-shu-puer.png",
    alt: "Чай Шу Пуэр",
  },
  "Чай Эрл Грей": {
    src: "/product-images/drinks/tea-earl-grey.png",
    alt: "Чай Эрл Грей",
  },
  "Чай травяной": {
    src: "/product-images/drinks/tea-herbal.png",
    alt: "Чай травяной",
  },
  "Чай Моли Хуа Ча": {
    src: "/product-images/drinks/tea-moli-hua-cha.png",
    alt: "Чай Моли Хуа Ча",
  },
  "Чай Те Гуанинь": {
    src: "/product-images/drinks/tea-te-guanin.png",
    alt: "Чай Те Гуанинь",
  },
  "Стакан средний": {
    src: "/product-images/drinks/medium-cup.png",
    alt: "Стакан средний",
  },
  "Айс Латте": {
    src: "/product-images/drinks/iced-latte.png",
    alt: "Айс Латте",
  },
  "Апельсиновый Бамбл": {
    src: "/product-images/drinks/orange-bumble.png",
    alt: "Апельсиновый Бамбл",
  },
  "Маття-тоник": {
    src: "/product-images/drinks/matcha-tonic.png",
    alt: "Маття-тоник",
  },
  "Эспрессо-тоник": {
    src: "/product-images/drinks/espresso-tonic.png",
    alt: "Эспрессо-тоник",
  },
  "Айс Какао": {
    src: "/product-images/drinks/iced-cacao.png",
    alt: "Айс Какао",
  },
  "Холодный раф": {
    src: "/product-images/drinks/cold-raf.png",
    alt: "Холодный раф",
  },
  "Самери Шу": {
    src: "/product-images/drinks/sameri-shu.png",
    alt: "Самери Шу",
  },
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
