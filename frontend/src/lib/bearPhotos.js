export const BEAR_PHOTOS = [
  {
    id: "ranthambore-walk",
    src: "/images/bears/gallery/sloth-bear-ranthambore.jpg",
    alt: "Indian sloth bear walking in Ranthambore National Park",
    credit: "Giles Laurent",
    source: "https://commons.wikimedia.org/wiki/File:077_Sloth_bear_in_Ranthambore_National_Park_Photo_by_Giles_Laurent.jpg",
  },
  {
    id: "daroji-foraging",
    src: "/images/bears/gallery/sloth-bear-daroji.jpg",
    alt: "Indian sloth bear photographed at Daroji, India",
    credit: "Rudraksha Chodankar",
    source: "https://commons.wikimedia.org/wiki/File:Sloth_Bear-3348.jpg",
  },
  {
    id: "bor-mother-cubs",
    src: "/images/bears/gallery/mother-and-cubs-bor.jpg",
    alt: "Sloth bear mother walking through a forest with her cubs",
    credit: "Rohit Sharma",
    source: "https://commons.wikimedia.org/wiki/File:Sloth_Bear_with_Cubs_at_Bor_tiger_reserve,_Maharashtra,_India.jpg",
  },
  {
    id: "kanha-sloth-bear",
    src: "/images/bears/gallery/sloth-bear-kanha.jpg",
    alt: "Indian sloth bear in Kanha National Park",
    credit: "Paras31194",
    source: "https://commons.wikimedia.org/wiki/File:Indian_sloth_bear.jpg",
  },
  {
    id: "bannerghatta-crossing",
    src: "/images/bears/gallery/sloth-bear-bannerghatta.jpg",
    alt: "Sloth bear crossing its natural habitat in India",
    credit: "Saumitra Newalkar",
    source: "https://commons.wikimedia.org/wiki/File:SlothBear.jpg",
  },
  {
    id: "bannerghatta-forest",
    src: "/images/bears/gallery/sloth-bear-forest.jpg",
    alt: "Indian sloth bear in Bannerghatta National Park",
    credit: "Kartikeya Pant",
    source: "https://commons.wikimedia.org/wiki/File:Slothbear.jpg",
  },
  {
    id: "bandhavgarh-sloth-bear",
    src: "/images/bears/gallery/sloth-bear-bandhavgarh.jpg",
    alt: "Sloth bear in Bandhavgarh National Park, India",
    credit: "Tisha Mukherjee",
    source: "https://commons.wikimedia.org/wiki/File:Sloth_bear_in_Bandhavgarh_National_Park_May_2026_by_Tisha_Mukherjee_04.jpg",
  },
  {
    id: "daroji-mother-cub",
    src: "/images/bears/gallery/mother-cub-daroji.jpg",
    alt: "Sloth bear mother with her cub in Daroji, India",
    credit: "L. Shyamal",
    source: "https://commons.wikimedia.org/wiki/File:SlothBearMotherCub.jpg",
  },
  {
    id: "corbett-sloth-bears",
    src: "/images/bears/gallery/sloth-bears-corbett.jpg",
    alt: "Sloth bears in Jim Corbett National Park",
    credit: "Sruthijp96",
    source: "https://commons.wikimedia.org/wiki/File:Wildlife_of_Jim_Corbett_National_Park.jpg",
  },
  {
    id: "daroji-foraging-bear",
    src: "/images/bears/gallery/sloth-bear-foraging.jpg",
    alt: "Sloth bear foraging in Daroji, India",
    credit: "L. Shyamal",
    source: "https://commons.wikimedia.org/wiki/File:SlothBear1.jpg",
  },
  {
    id: "sloth-bear-carrying-cub",
    src: "/images/bears/gallery/sloth-bear-carrying-cub.jpg",
    alt: "Sloth bear carrying a cub in India",
    credit: "Basavaraj M",
    source: "https://commons.wikimedia.org/wiki/File:Sloth_bear_carrying_cub.jpg",
  },
  {
    id: "indian-sloth-bear-portrait",
    src: "/images/bears/gallery/sloth-bear-portrait.jpg",
    alt: "Portrait of an Indian sloth bear",
    credit: "Vishalsh521",
    source: "https://commons.wikimedia.org/wiki/File:An_Indian_Sloth_Bear.jpg",
  },
];

export const getBearPhoto = (index = 0) =>
  BEAR_PHOTOS[((index % BEAR_PHOTOS.length) + BEAR_PHOTOS.length) % BEAR_PHOTOS.length];

export const getApprovedBearPhoto = (url, fallbackIndex = 0) =>
  BEAR_PHOTOS.find((photo) => photo.src === url) || getBearPhoto(fallbackIndex);
