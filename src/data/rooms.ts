import { SOURCES, type Source } from './sources'

export type RoomId =
  | 'forecourt'
  | 'hall-of-kenya'
  | 'birds'
  | 'mammals'
  | 'cradle'
  | 'asian-african'
  | 'numismatic'
  | 'creativity'
  | 'historia'
  | 'cycles'
  | 'joy-adamson'
  | 'courtyard'
  | 'snake-park'
  | 'gardens'

export type Wall = 'n' | 's' | 'e' | 'w'
export type Level = 'grounds' | 'ground' | 'upper'

export type Photo = { src: string; caption: string; illustrative?: boolean }

export type Exhibit = {
  id: string
  title: string
  kicker: string
  body: string[]
  source: Source
  photo?: Photo
  /** world position of the hotspot marker */
  pos: [number, number, number]
  /** where the camera glides to when the exhibit is selected (x, z) */
  view: [number, number]
}

export type Door = { to: RoomId; wall: Wall; offset: number; label?: string; open?: boolean }

export type Room = {
  id: RoomId
  numeral: string
  name: string
  level: Level
  tagline: string
  intro: string
  tags: string[]
  size: [number, number, number]
  outdoor?: boolean
  doors: Door[]
  exhibits: Exhibit[]
  cover?: string
  hasPhotos: boolean
  /** schematic plan rectangle, in map units */
  plan: { x: number; y: number; w: number; h: number }
  /** obstacles as circles [x, z, radius] for walk collisions */
  obstacles: [number, number, number][]
}

const P = (src: string, caption: string): Photo => ({ src: `/photos/${src}`, caption })
const I = (src: string, caption: string): Photo => ({ src: `/illustrative/${src}`, caption, illustrative: true })

export const LEVEL_LABEL: Record<Level, string> = {
  grounds: 'Museum grounds',
  ground: 'Ground floor',
  upper: 'Upper floor',
}

export const ROOMS: Room[] = [
  {
    id: 'forecourt',
    numeral: '0',
    name: 'The Forecourt',
    level: 'grounds',
    tagline: 'Arrive on Museum Hill',
    intro:
      'Twenty minutes from the Central Business District, the museum sits on Museum Hill behind a forecourt of red clay pavers, terracotta columns and a sculpture garden.',
    tags: ['Clay brick paving', 'Terracotta columns', 'Sculpture garden'],
    size: [44, 36, 0],
    outdoor: true,
    cover: '/photos/museum-entrance.jpg',
    hasPhotos: true,
    plan: { x: 32, y: 72, w: 32, h: 13 },
    doors: [
      { to: 'hall-of-kenya', wall: 'n', offset: 0, label: 'Enter · Hall of Kenya', open: true },
      { to: 'snake-park', wall: 'w', offset: 2 },
      { to: 'courtyard', wall: 'e', offset: -6 },
      { to: 'gardens', wall: 'e', offset: 6 },
    ],
    exhibits: [
      {
        id: 'facade',
        title: 'Nairobi National Museum',
        kicker: 'Opened 22 September 1930',
        body: [
          'The museum began in 1910 with the East Africa and Uganda Natural History Society, naturalists who needed somewhere to keep their specimens. Its first home was on the site of today\u2019s Nyayo House; a larger building followed in 1922 where the Nairobi Serena Hotel now stands.',
          'In 1929 the colonial government set aside land on Museum Hill. The Coryndon Museum opened here on 22 September 1930 and was renamed the National Museum of Kenya after independence in 1963.',
          'The museum closed on 15 October 2005 for an extensive modernisation and expansion, and reopened in June 2008 as the Nairobi National Museum.',
        ],
        source: SOURCES.nnm,
        photo: P('museum-entrance.jpg', 'The main entrance on Museum Hill'),
        pos: [0, 6.6, -17.6],
        view: [0, -5],
      },
      {
        id: 'sculpture',
        title: 'The forecourt sculpture',
        kicker: 'Botanical Gardens & Sculpture Park',
        body: [
          'A metal tree hung with mosaic discs greets visitors at the steps. It is part of the outdoor sculpture collection that runs through the museum grounds.',
          'The grounds are described by the museum as serene outdoor spaces for relaxation and photography, alongside the shopping and dining facilities around the main building.',
        ],
        source: SOURCES.photo,
        photo: P('museum-facade.jpg', 'The sculpture and the entrance colonnade'),
        pos: [-9, 3.6, -9],
        view: [-5, -3.5],
      },
      {
        id: 'tickets',
        title: 'Plan your visit',
        kicker: 'Hours and tickets',
        body: [
          'Open Monday to Sunday, 8:30 am to 5:30 pm, all year round including public holidays and weekends. Night tours run from 6 pm to 10 pm for organised groups of at least ten, booked in advance.',
          'From 7 May 2026: museum entry is KSh 350 for Kenyan and East African adult citizens, US$ 9 for residents and the rest of Africa, and US$ 18 for visitors from outside Africa. A combined museum and Snake Park adult ticket is KSh 600, US$ 15 or US$ 25.',
          'There is no cash at the desk: tickets are paid for through eCitizen. Visitors without a Kenyan number can call 0721 308 485 to book.',
        ],
        source: SOURCES.rates,
        pos: [6.8, 2.3, -13.8],
        view: [4.5, -8],
      },
    ],
    obstacles: [
      [-9, -9, 2.7],
      [6.8, -13.8, 1.2],
      [-3.6, -16.1, 1],
      [3.6, -16.1, 1],
      [14, -15, 3],
      [-14, -15, 2.4],
    ],
  },
  {
    id: 'hall-of-kenya',
    numeral: 'I',
    name: 'Hall of Kenya',
    level: 'ground',
    tagline: 'Where nature, culture and history meet',
    intro:
      'The permanent galleries open from the Hall of Kenya, the double-height hall of the original 1930 building, dedicated to the country\u2019s tangible and intangible heritage.',
    tags: ['1930 Coryndon hall', 'Parquet floor', 'Calabash centrepiece'],
    size: [22, 30, 11],
    cover: '/photos/hall-of-kenya.jpg',
    hasPhotos: true,
    plan: { x: 36, y: 38, w: 24, h: 28 },
    doors: [
      { to: 'forecourt', wall: 's', offset: 0, label: 'Out · Forecourt' },
      { to: 'birds', wall: 'w', offset: -3 },
      { to: 'mammals', wall: 'e', offset: -3 },
      { to: 'historia', wall: 'n', offset: -7, label: 'Upstairs · Historia ya Kenya' },
      { to: 'creativity', wall: 'n', offset: 7 },
    ],
    exhibits: [
      {
        id: 'calabashes',
        title: 'The calabash centrepiece',
        kicker: 'Showpiece of the Hall of Kenya',
        body: [
          'Hundreds of calabashes form the showpiece of the hall, heaped in a great dish and strung up towards a giant ladle overhead. The installation honours the cultural legacy of all Kenyan communities.',
          'Gourds are used across Kenya to carry water and milk, ferment porridge, store seed and make music. Here they rise as one shared object.',
        ],
        source: SOURCES.olesereni,
        photo: P('hall-of-kenya-calabashes.jpg', 'The calabash installation beneath the mezzanine'),
        pos: [0, 3.2, 0],
        view: [0, 8.5],
      },
      {
        id: 'hall-intro',
        title: 'A hall for all of Kenya',
        kicker: 'Tangible and intangible heritage',
        body: [
          'The Hall of Kenya highlights the country\u2019s unique tangible and intangible heritage. The objects on display are a testimony to its diverse and rich heritage.',
          'The information, objects and research behind the displays come from the museum\u2019s Cultural Anthropology department.',
        ],
        source: SOURCES.blavals,
        photo: P('hall-of-kenya.jpg', 'The Hall of Kenya with its white columns and mezzanine'),
        pos: [-10.7, 2.4, 6],
        view: [-5.5, 6],
      },
      {
        id: 'butterfly-map',
        title: 'Butterfly map of Kenya',
        kicker: 'Mosaic of wings',
        body: [
          'Among the first objects in the hall is a mosaic map of Kenya made from the country\u2019s butterflies, a reminder that the nation\u2019s natural diversity is part of its heritage.',
        ],
        source: SOURCES.guide,
        photo: I('butterfly-map.jpg', 'Illustrative impression of the butterfly map'),
        pos: [-10.8, 3, -9],
        view: [-6.5, -9],
      },
      {
        id: 'cloak',
        title: 'Kalenjin monkey-skin cloak',
        kicker: 'Ethnographic collection',
        body: [
          'Visitors often single out an extraordinary Kalenjin cloak made from the skins of Sykes\u2019 monkeys, one of the ethnographic pieces that introduce the permanent collection.',
        ],
        source: SOURCES.guide,
        pos: [9, 2.1, 5],
        view: [4.5, 7.5],
      },
      {
        id: 'coryndon',
        title: 'From Coryndon Museum to NMK',
        kicker: 'The building',
        body: [
          'This hall belongs to the building that opened on Museum Hill in 1930 as the Coryndon Museum, named after Sir Robert Coryndon, a one-time Governor of Kenya.',
          'The 2005\u20132008 modernisation added new wings around the historic core, producing a building the museum describes as able to compete with other world-class museums.',
        ],
        source: SOURCES.nnm,
        pos: [10.8, 3, -9],
        view: [6.5, -9],
      },
    ],
    obstacles: [
      [0, 0, 3.3],
      ...[-10, -6, -2, 2, 6, 10].flatMap((z): [number, number, number][] => [
        [-6.5, z, 0.6],
        [6.5, z, 0.6],
      ]),
      [-9, -3, 1],
      [9, -3, 1],
      [9, 5, 1],
      [-9, 9, 0.9],
      [9, 9, 0.9],
      [0, -13.2, 2.8],
    ],
  },
  {
    id: 'birds',
    numeral: 'II',
    name: 'Birds of East Africa',
    level: 'ground',
    tagline: 'Hundreds of birds in family groups',
    intro:
      'The bird gallery shows the diversity of East African birds arranged in family groups such as birds of prey, water birds and sunbirds, so visitors can see how each is adapted to its environment and way of feeding.',
    tags: ['Family groups', 'Pale-green cases', 'About 900 specimens'],
    size: [18, 24, 5],
    cover: '/photos/birds-of-east-africa.jpg',
    hasPhotos: true,
    plan: { x: 6, y: 40, w: 26, h: 18 },
    doors: [
      { to: 'hall-of-kenya', wall: 'e', offset: 6 },
      { to: 'mammals', wall: 'n', offset: 0 },
    ],
    exhibits: [
      {
        id: 'birds-intro',
        title: 'Birds of East Africa',
        kicker: 'Adapted to place and food',
        body: [
          'The gallery depicts the diversity of the birds of East Africa arranged in family groups, such as birds of prey, water birds and sunbirds.',
          'Grouping them this way helps visitors see the different ways birds are adapted to their environment and feeding.',
        ],
        source: SOURCES.nnm,
        photo: P('birds-of-east-africa.jpg', 'Bird cases in the Nairobi National Museum'),
        pos: [0, 2.6, -2],
        view: [0, 4.5],
      },
      {
        id: 'water-birds',
        title: 'Water birds',
        kicker: 'Cormorants, darters and herons',
        body: [
          'Cormorants and darters dive for fish in Kenya\u2019s lakes and rivers; their cases sit beside nests and eggs, showing how the birds raise young at the water\u2019s edge.',
          'Water birds are one of the family groups the museum uses to organise the collection.',
        ],
        source: SOURCES.nnm,
        pos: [8.4, 2.2, -5],
        view: [4.5, -5],
      },
      {
        id: 'sunbirds',
        title: 'Sunbirds and songbirds',
        kicker: 'Small birds, many adaptations',
        body: [
          'Long wall cases hold rows of small birds, each with its label. Sunbirds, with their curved bills for reaching nectar, are one of the family groups named by the museum.',
        ],
        source: SOURCES.nnm,
        pos: [-8.4, 2.2, -5],
        view: [-4.5, -5],
      },
      {
        id: 'bird-count',
        title: 'A very large collection',
        kicker: 'Around 900 specimens',
        body: [
          'Guides describe the bird gallery as a huge room of at least 900 mounted specimens, one of the largest displays of East African birds anywhere.',
        ],
        source: SOURCES.guide,
        pos: [-8.4, 2.2, 5],
        view: [-4.5, 5],
      },
    ],
    obstacles: [
      [0, -2, 2.4],
      [0, -3.2, 2.4],
    ],
  },
  {
    id: 'mammals',
    numeral: 'III',
    name: 'Great Hall of Mammals',
    level: 'ground',
    tagline: 'The Story of Mammals',
    intro:
      'The museum calls this gallery the Story of Mammals. It runs from the large elephant to bats and shrews, in three themes: evolution, locomotion, and feeding adaptation and defence.',
    tags: ['Round plinth', 'Arched openings', 'Mounted specimens'],
    size: [26, 26, 10],
    cover: '/photos/great-hall-of-mammals.jpg',
    hasPhotos: true,
    plan: { x: 64, y: 42, w: 22, h: 20 },
    doors: [
      { to: 'hall-of-kenya', wall: 'w', offset: 6 },
      { to: 'birds', wall: 's', offset: -8 },
      { to: 'cradle', wall: 'n', offset: 0 },
    ],
    exhibits: [
      {
        id: 'elephant',
        title: 'The African elephant',
        kicker: 'Centre of the hall',
        body: [
          'A full-size elephant stands at the heart of the Great Hall of Mammals, with giraffe, zebra, buffalo, warthog and antelope on a raised plinth of red earth, as in the museum\u2019s own photograph of the hall.',
          'The gallery tells the story of mammals from the large elephant to bats and shrews.',
        ],
        source: SOURCES.nnm,
        photo: P('great-hall-of-mammals.jpg', 'The Great Hall of Mammals'),
        pos: [-0.6, 5.2, 0.4],
        view: [0, 10],
      },
      {
        id: 'evolution',
        title: 'Evolution',
        kicker: 'Theme one',
        body: [
          'The mammal story is captured in themes, beginning with evolution: how mammals radiated into the forms that live across Kenya today, from savannah grazers to forest primates.',
        ],
        source: SOURCES.nnm,
        pos: [-12.8, 2.4, -3.5],
        view: [-8, -3.5],
      },
      {
        id: 'locomotion',
        title: 'Locomotion',
        kicker: 'Theme two',
        body: [
          'Running, climbing, swimming and flying: the hall compares how different mammals move, from the long stride of the giraffe to the wings of bats.',
        ],
        source: SOURCES.nnm,
        pos: [12.8, 2.4, -3.5],
        view: [8, -3.5],
      },
      {
        id: 'feeding-defence',
        title: 'Feeding and defence',
        kicker: 'Theme three',
        body: [
          'Feeding adaptation and defence mechanism are the third theme the museum names: teeth, trunks and tongues for eating; horns, armour, speed and camouflage for staying alive.',
        ],
        source: SOURCES.nnm,
        pos: [12.8, 2.4, 6],
        view: [8, 6],
      },
    ],
    obstacles: [
      [0, 0, 6.6],
      [0, 6.6, 0.9],
    ],
  },
  {
    id: 'cradle',
    numeral: 'IV',
    name: 'Cradle of Humankind',
    level: 'ground',
    tagline: 'Early humans and Stone Age tools',
    intro:
      'In the Cradle of Humankind gallery visitors meet early humans and Stone Age tools first hand, with fossil finds and stone tools from Koobi Fora.',
    tags: ['Hominid fossils', 'Koobi Fora tools', 'Turkana Boy'],
    size: [22, 22, 6],
    cover: '/photos/human-origins.jpg',
    hasPhotos: true,
    plan: { x: 64, y: 20, w: 22, h: 18 },
    doors: [
      { to: 'mammals', wall: 's', offset: 0 },
      { to: 'asian-african', wall: 'e', offset: 0 },
    ],
    exhibits: [
      {
        id: 'turkana-boy',
        title: 'Turkana Boy',
        kicker: 'Homo erectus · KNM-WT 15000',
        body: [
          'The skeleton of a young Homo erectus found at Nariokotome, west of Lake Turkana, in 1984 by a team led by Kamoya Kimeu. It is about 1.5 million years old and is one of the most complete early human skeletons ever found.',
          'The Turkana Boy exhibit is one of the best-known displays in the Cradle of Humankind gallery.',
        ],
        source: SOURCES.background,
        photo: P('turkana-boy.jpg', 'The Turkana Boy exhibit'),
        pos: [0, 1.6, 1],
        view: [0, 5.5],
      },
      {
        id: 'skull-room',
        title: 'The Hominid Skull Room',
        kicker: 'Early human fossils',
        body: [
          'A room of skulls that describes itself as \u201cthe single most important collection of early human fossils in the world\u201d, tracing our ancestors across millions of years of the Rift Valley.',
        ],
        source: SOURCES.guide,
        pos: [-9.6, 2, -2],
        view: [-5.5, -2],
      },
      {
        id: 'diorama',
        title: 'Life in the Rift Valley',
        kicker: 'Diorama',
        body: [
          'A life-size diorama places early humans in a savannah landscape, gathering plants and working stone, so visitors can picture the world the fossils come from.',
        ],
        source: SOURCES.nmk,
        photo: P('hominid-diorama.jpg', 'Early human diorama'),
        pos: [0, 2.2, -10.4],
        view: [0, -5.5],
      },
      {
        id: 'koobi-fora',
        title: 'Stone tools from Koobi Fora',
        kicker: 'Human Evolution Gallery',
        body: [
          'The gallery showcases significant fossil finds and stone tools from Koobi Fora on the eastern shore of Lake Turkana, shedding light on human origins.',
        ],
        source: SOURCES.nmk,
        photo: P('human-origins.jpg', 'The human origins gallery'),
        pos: [8, 1.5, 4],
        view: [4, 6.5],
      },
    ],
    obstacles: [
      [0, 1, 2],
      [8, 4, 1.4],
    ],
  },
  {
    id: 'asian-african',
    numeral: 'V',
    name: 'Asian African Heritage',
    level: 'ground',
    tagline: 'Communities that crossed the ocean',
    intro:
      'One of the museum\u2019s permanent exhibitions, telling the story of Kenyans of Asian descent and their part in the country\u2019s history.',
    tags: ['Permanent exhibition', 'Photographs', 'Trade and railway'],
    size: [16, 16, 5],
    hasPhotos: false,
    plan: { x: 88, y: 20, w: 10, h: 15 },
    doors: [
      { to: 'cradle', wall: 'w', offset: 0 },
      { to: 'numismatic', wall: 's', offset: 0 },
    ],
    exhibits: [
      {
        id: 'aah-intro',
        title: 'Asian African Heritage',
        kicker: 'Permanent gallery',
        body: [
          'The museum lists the Asian African Heritage exhibition among its permanent galleries, alongside the Cradle of Humankind, the Story of Mammals, the History of Kenya, Cycles of Life and the Numismatic exhibition.',
          'The exhibition follows the people who crossed the Indian Ocean to work, trade and settle in East Africa, and their contribution to Kenyan public life.',
        ],
        source: SOURCES.nnm,
        pos: [0, 2.2, -7.8],
        view: [0, -2.5],
      },
      {
        id: 'railway-workers',
        title: 'Workers, traders, citizens',
        kicker: 'Three chapters',
        body: [
          'Wall panels move from the indentured workers of the Uganda Railway to the dukawallah traders of upcountry towns and the professionals and activists of independent Kenya.',
        ],
        source: SOURCES.background,
        pos: [-7.8, 2.2, 0],
        view: [-3, 0],
      },
    ],
    obstacles: [[0, 1, 1.4]],
  },
  {
    id: 'numismatic',
    numeral: 'VI',
    name: 'Numismatic Exhibition',
    level: 'ground',
    tagline: 'Trade, exchange and banking',
    intro:
      'Trade and exchange, the history of banking and the application of digital technology in trade, with historical and current currencies and an interactive savings programme for children.',
    tags: ['Historic currencies', 'Banking history', 'Interactive savings'],
    size: [16, 16, 5],
    hasPhotos: false,
    plan: { x: 88, y: 37, w: 10, h: 15 },
    doors: [
      { to: 'asian-african', wall: 'n', offset: 0 },
      { to: 'creativity', wall: 'w', offset: 4 },
    ],
    exhibits: [
      {
        id: 'currencies',
        title: 'Historical and current currencies',
        kicker: 'Trade and exchange',
        body: [
          'The Numismatic exhibition explores trade and exchange, displaying current currencies alongside historical ones.',
        ],
        source: SOURCES.nnm,
        pos: [-3, 1.5, -2],
        view: [-3, 2],
      },
      {
        id: 'banking',
        title: 'From barter to mobile money',
        kicker: 'Banking and digital trade',
        body: [
          'The story continues through the history of banking to the application of digital technology in trade and banking, a subject close to home in the country that popularised mobile money.',
        ],
        source: SOURCES.nnm,
        pos: [3, 1.5, -2],
        view: [3, 2],
      },
      {
        id: 'savings',
        title: 'Learn to save',
        kicker: 'Interactive programme',
        body: [
          'An interactive programme on banking encourages young children to learn good saving practices.',
        ],
        source: SOURCES.nnm,
        pos: [6.8, 1.6, 4],
        view: [3.5, 4],
      },
    ],
    obstacles: [
      [-3, -2, 1.3],
      [3, -2, 1.3],
      [7, 4, 0.9],
    ],
  },
  {
    id: 'creativity',
    numeral: 'VII',
    name: 'Creativity Gallery',
    level: 'ground',
    tagline: 'Contemporary Kenyan art',
    intro:
      'A bright gallery of white partition walls for temporary exhibitions and contemporary art, part of the museum\u2019s culture pillar alongside Cycles of Life.',
    tags: ['Temporary exhibitions', 'Partition walls', 'Sculpture'],
    size: [22, 18, 6],
    cover: '/photos/creativity-gallery.jpg',
    hasPhotos: true,
    plan: { x: 36, y: 20, w: 24, h: 14 },
    doors: [
      { to: 'hall-of-kenya', wall: 's', offset: 7 },
      { to: 'numismatic', wall: 'e', offset: 0 },
    ],
    exhibits: [
      {
        id: 'creativity-intro',
        title: 'The Creativity Gallery',
        kicker: 'Culture pillar',
        body: [
          'The museum is modelled around nature, culture and history. Culture includes creativity, cycles of life and cultural dynamism.',
          'The museum also hosts temporary exhibitions spotlighting specific themes, from Kenyan art to scientific discoveries.',
        ],
        source: SOURCES.kgeo,
        photo: P('creativity-gallery.jpg', 'The Creativity Gallery'),
        pos: [0, 2.4, -8.6],
        view: [0, -3],
      },
      {
        id: 'sculpture-figure',
        title: 'Horse and rider',
        kicker: 'Bronze sculpture',
        body: [
          'A dark bronze horse and rider rears up in the open floor of the gallery, among paintings hung on free-standing partition walls, as seen in the museum\u2019s own photograph of the room.',
        ],
        source: SOURCES.photo,
        pos: [4, 1.8, 2],
        view: [1, 5],
      },
    ],
    obstacles: [
      [4, 2, 0.8],
      [-5, 1, 0.5],
      [-5, 3, 0.5],
      [-5, -1, 0.5],
    ],
  },
  {
    id: 'historia',
    numeral: 'VIII',
    name: 'Historia ya Kenya',
    level: 'upper',
    tagline: 'Communities, colony, independence',
    intro:
      'The History of Kenya gallery covers the origin of Kenya\u2019s communities and language groups, the pre-colonial and colonial periods, the struggle for independence and independence itself.',
    tags: ['Three phases', 'Railway and land', 'Independence 1963'],
    size: [24, 16, 5],
    cover: '/photos/history-vitrine.jpg',
    hasPhotos: true,
    plan: { x: 6, y: 4, w: 26, h: 12 },
    doors: [
      { to: 'hall-of-kenya', wall: 's', offset: -8, label: 'Downstairs · Hall of Kenya' },
      { to: 'cycles', wall: 'e', offset: 0 },
    ],
    exhibits: [
      {
        id: 'phases',
        title: 'Three phases of history',
        kicker: 'Pre-colonial · colonial · independent',
        body: [
          'The gallery tells Kenya\u2019s story in three phases: pre-colonial Kenya, the period of colonial rule and independent Kenya.',
          'It starts with the origin of Kenya\u2019s different communities and language groups and the interaction among them.',
        ],
        source: SOURCES.blavals,
        pos: [-6, 2.4, -7.8],
        view: [-6, -3],
      },
      {
        id: 'railway',
        title: 'Railway, land and war',
        kicker: 'Colonial Kenya',
        body: [
          'Key events that shaped Kenyan lives are highlighted, including the Kenya\u2013Uganda Railway, land alienation and the two world wars.',
        ],
        source: SOURCES.blavals,
        pos: [4, 2.4, -7.8],
        view: [4, -3],
      },
      {
        id: 'independence',
        title: 'The struggle for independence',
        kicker: '12 December 1963',
        body: [
          'The last part of the gallery follows the struggle for independence and independence itself. Guides describe it as a refreshingly Kenyan counterpoint to colonial histories.',
        ],
        source: SOURCES.guide,
        photo: P('history-vitrine.jpg', 'A vitrine of textiles and photographs'),
        pos: [11.8, 2.2, 4],
        view: [7, 4],
      },
    ],
    obstacles: [[0, 2, 1.2]],
  },
  {
    id: 'cycles',
    numeral: 'IX',
    name: 'Cycles of Life',
    level: 'upper',
    tagline: 'Childhood, youth, adulthood, ancestors',
    intro:
      'Social interactions and cultural activities through the stages of life, from childhood and youth to adulthood and the ancestral stage, with traditional items from different communities.',
    tags: ['Four life stages', 'Traditional objects', 'Many communities'],
    size: [20, 18, 5],
    cover: '/photos/cycles-of-life.jpg',
    hasPhotos: true,
    plan: { x: 36, y: 4, w: 24, h: 12 },
    doors: [
      { to: 'historia', wall: 'w', offset: 0 },
      { to: 'joy-adamson', wall: 'e', offset: 0 },
    ],
    exhibits: [
      {
        id: 'childhood',
        title: 'Childhood',
        kicker: 'First stage',
        body: [
          'The gallery paints a picture of the social interactions and cultural activities of each stage of life. It begins with childhood: naming, care and the first lessons of a community.',
        ],
        source: SOURCES.nnm,
        photo: P('cycles-of-life.jpg', 'The Cycles of Life gallery'),
        pos: [-6, 1.8, -8.4],
        view: [-6, -4],
      },
      {
        id: 'youth',
        title: 'Youth',
        kicker: 'Second stage',
        body: ['Youth is marked by initiation, age-sets and learning adult roles. Learners can interact with traditional items from different communities.'],
        source: SOURCES.nnm,
        pos: [6, 1.8, -8.4],
        view: [6, -4],
      },
      {
        id: 'adulthood',
        title: 'Adulthood',
        kicker: 'Third stage',
        body: ['Adulthood brings marriage, homesteads, livelihoods and leadership, shown through the objects of daily and ceremonial life.'],
        source: SOURCES.nnm,
        pos: [9.8, 1.8, 4],
        view: [5, 4],
      },
      {
        id: 'ancestral',
        title: 'The ancestral stage',
        kicker: 'Fourth stage',
        body: ['The cycle closes with the ancestral stage, when elders pass on and are remembered by the community they helped to shape.'],
        source: SOURCES.nnm,
        pos: [-9.8, 1.8, 4],
        view: [-5, 4],
      },
    ],
    obstacles: [
      [-3, 0, 1.2],
      [3, 0, 1.2],
    ],
  },
  {
    id: 'joy-adamson',
    numeral: 'X',
    name: 'Joy Adamson Gallery',
    level: 'upper',
    tagline: 'The Peoples of Kenya, painted',
    intro:
      'Joy Adamson (1910\u20131980) was an illustrator, conservationist and author. This gallery shows her portraits of Kenyan communities in traditional attire, with her botanical and wildlife illustrations.',
    tags: ['Portraits', 'Botanical studies', 'Opened May 2014'],
    size: [18, 14, 5],
    hasPhotos: false,
    plan: { x: 64, y: 4, w: 22, h: 12 },
    doors: [
      { to: 'cycles', wall: 'w', offset: 0 },
      { to: 'hall-of-kenya', wall: 's', offset: 5, label: 'Downstairs · Hall of Kenya' },
    ],
    exhibits: [
      {
        id: 'joy-intro',
        title: 'Joy Adamson',
        kicker: 'Illustrator, conservationist, author',
        body: [
          'Joy Adamson is known for her contribution to the conservation of Kenya\u2019s natural and cultural heritage, which won her international acclaim. Her work lives on in her illustrations, books and films.',
          'All works by Joy Adamson are housed in the museum\u2019s archives.',
        ],
        source: SOURCES.blavals,
        pos: [0, 2.2, -6.8],
        view: [0, -2],
      },
      {
        id: 'peoples',
        title: 'Peoples of Kenya',
        kicker: 'Over seven hundred portraits',
        body: [
          'Commissioned to record Kenya\u2019s communities, Joy Adamson painted portraits of men and women in traditional dress across the country, completing more than seven hundred in total.',
          'The exhibition opened on 19 May 2014, funded by the Kenya Museum Society, with 50 portraits complemented by objects from the museum\u2019s ethnographic collections.',
        ],
        source: SOURCES.kms,
        pos: [-8.8, 2.2, 0],
        view: [-4.5, 0],
      },
      {
        id: 'botanicals',
        title: 'Botanical and wildlife studies',
        kicker: 'Where she began',
        body: [
          'She began painting with wildflowers soon after arriving in Kenya, and her botanical and wildlife illustrations hang alongside the portraits.',
        ],
        source: SOURCES.kgeo,
        photo: I('botanical.jpg', 'Illustrative botanical study (not an Adamson original)'),
        pos: [8.8, 2.2, 0],
        view: [4.5, 0],
      },
    ],
    obstacles: [[0, 1, 1]],
  },
  {
    id: 'courtyard',
    numeral: 'XI',
    name: 'Ahmed\u2019s Courtyard',
    level: 'grounds',
    tagline: 'The elephant who was guarded by decree',
    intro:
      'In the inner courtyard, next to the shop, stands a life-size fibreglass model of Ahmed, the Marsabit elephant who became a symbol of Kenya.',
    tags: ['Life-size replica', 'Inner courtyard', 'Stone walls'],
    size: [26, 26, 0],
    outdoor: true,
    hasPhotos: false,
    plan: { x: 70, y: 68, w: 16, h: 14 },
    doors: [
      { to: 'forecourt', wall: 's', offset: 0 },
      { to: 'gardens', wall: 'e', offset: 0 },
    ],
    exhibits: [
      {
        id: 'ahmed',
        title: 'Ahmed of Marsabit',
        kicker: 'Life-size replica',
        body: [
          'Ahmed was a huge bull elephant with tusks so long they almost touched the ground. At the height of the poaching crisis he was placed under 24-hour guard by presidential decree of Jomo Kenyatta.',
          'His life-size fibreglass model stands here in the inner courtyard, next to the museum shop.',
        ],
        source: SOURCES.guide,
        pos: [0, 4.4, 0],
        view: [0, 9],
      },
    ],
    obstacles: [
      [0, 0, 4.6],
      [-9, -9, 1.6],
      [9, -9, 1.6],
    ],
  },
  {
    id: 'snake-park',
    numeral: 'XII',
    name: 'Snake Park & Aquarium',
    level: 'grounds',
    tagline: 'Rescued reptiles since 1961',
    intro:
      'Started in January 1961 as a visitor attraction and research centre on reptiles, the Snake Park is also a home for rescued and threatened reptiles, with an aquarium of fresh-water and marine fish.',
    tags: ['Snake houses', 'Crocodile pond', 'Aquarium'],
    size: [32, 28, 0],
    outdoor: true,
    cover: '/photos/snake-park.jpg',
    hasPhotos: true,
    plan: { x: 4, y: 66, w: 24, h: 20 },
    doors: [
      { to: 'forecourt', wall: 'e', offset: 2 },
      { to: 'gardens', wall: 's', offset: -8 },
    ],
    exhibits: [
      {
        id: 'snake-houses',
        title: 'Venomous and non-venomous snakes',
        kicker: 'Nairobi Snake Park, since 1961',
        body: [
          'The Nairobi Snake Park was started in January 1961 as a popular attraction for visitors and as a research centre on reptiles and snake breeding.',
          'Venomous and non-venomous snakes are shown to create awareness of threatened and endangered species, and the park is home to rescued, feared, injured and unwanted reptiles from the community.',
        ],
        source: SOURCES.snake,
        photo: P('snake-park.jpg', 'A snake at the Nairobi Snake Park'),
        pos: [-8, 2.4, -10],
        view: [-8, -5],
      },
      {
        id: 'alligator',
        title: 'The American alligator',
        kicker: 'Donated in 1967',
        body: [
          'Researchers donated specimens from Kenya and abroad. Among the donations was an American alligator in 1967, which remains the centre of attraction.',
          'Crocodiles, tortoises, turtles and lizards are also on show.',
        ],
        source: SOURCES.snake,
        pos: [6, 1.2, 1],
        view: [6, 7.5],
      },
      {
        id: 'aquarium',
        title: 'The aquarium',
        kicker: 'Fresh water and Indian Ocean',
        body: [
          'The aquarium shows fresh-water fish from Kenya\u2019s lakes, dams and rivers, and fish from Lakes Malawi and Tanganyika.',
          'The marine section displays assorted fish, live corals and other invertebrates from the Indian Ocean.',
        ],
        source: SOURCES.snake,
        photo: I('aquarium-fresh.jpg', 'Illustrative impression of the fresh-water tanks'),
        pos: [9, 2.2, -10.4],
        view: [9, -5],
      },
      {
        id: 'handling',
        title: 'Meet a python',
        kicker: 'Education',
        body: [
          'Keepers use gentle, supervised encounters with non-venomous snakes to replace fear with understanding, part of the park\u2019s role as a research and training hub on reptiles.',
        ],
        source: SOURCES.photo,
        photo: P('snake-park-python.jpg', 'A python encounter at the Snake Park'),
        pos: [-12, 2.2, 4],
        view: [-8, 4],
      },
    ],
    obstacles: [
      [6, 1, 4.4],
      [-12.5, 8.5, 2.2],
    ],
  },
  {
    id: 'gardens',
    numeral: 'XIII',
    name: 'Botanic Gardens & Nature Trail',
    level: 'grounds',
    tagline: 'A serene garden on the hill',
    intro:
      'Botanical gardens and a nature trail surround the museum, offering a serene setting for relaxation and photography between galleries.',
    tags: ['Nature trail', 'Indigenous trees', 'Sculpture park'],
    size: [38, 38, 0],
    outdoor: true,
    hasPhotos: false,
    plan: { x: 4, y: 90, w: 94, h: 12 },
    doors: [
      { to: 'forecourt', wall: 'w', offset: 6 },
      { to: 'snake-park', wall: 'n', offset: -8 },
      { to: 'courtyard', wall: 'n', offset: 8 },
    ],
    exhibits: [
      {
        id: 'gardens-intro',
        title: 'The Botanic Gardens',
        kicker: 'Serene outdoor space',
        body: [
          'In addition to the galleries, visitors enjoy botanical gardens that offer a serene environment, together with the Sculpture Park.',
          'The grounds are home to the Snake Park, the Botanical Gardens and a Nature Trail.',
        ],
        source: SOURCES.nnm,
        pos: [0, 2, 0],
        view: [0, 6],
      },
      {
        id: 'research',
        title: 'Behind the scenes: botany',
        kicker: 'Directorate of National Repository & Research',
        body: [
          'The museum houses research departments in palaeontology, archaeology, botany, zoology and cultural anthropology. Scholars and students can use the Resource Centre by appointment.',
        ],
        source: SOURCES.nmk,
        pos: [-10, 1.8, -10],
        view: [-6, -6],
      },
    ],
    obstacles: [
      [0, 0, 1.6],
      [-10, -10, 1],
      [-10, -4, 1.1],
      [-4, 14, 1],
      [15, 0, 0.8],
      [-6, -14, 0.8],
      [11, -8, 1.2],
      [-12, 9, 1.2],
      [12, 10, 1.2],
      [6, -14, 1.1],
      [-14, -2, 1.1],
    ],
  },
]

export const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, Room>

export const TOUR_ORDER: RoomId[] = [
  'forecourt',
  'hall-of-kenya',
  'birds',
  'mammals',
  'cradle',
  'asian-african',
  'numismatic',
  'creativity',
  'historia',
  'cycles',
  'joy-adamson',
  'courtyard',
  'snake-park',
  'gardens',
]

export function exhibit(roomId: RoomId, id: string): Exhibit {
  const e = ROOM_BY_ID[roomId].exhibits.find((x) => x.id === id)
  if (!e) throw new Error(`Unknown exhibit ${roomId}/${id}`)
  return e
}

/** Position of a door on its wall, and the inward-facing spawn point in front of it. */
export function doorPlacement(room: Room, door: Door) {
  const [w, d] = room.size
  const hw = w / 2
  const hd = d / 2
  switch (door.wall) {
    case 'n':
      return { x: door.offset, z: -hd, rotY: 0, spawn: [door.offset, -hd + 2.2] as [number, number], face: Math.PI }
    case 's':
      return { x: door.offset, z: hd, rotY: Math.PI, spawn: [door.offset, hd - 2.2] as [number, number], face: 0 }
    case 'w':
      return { x: -hw, z: door.offset, rotY: Math.PI / 2, spawn: [-hw + 2.2, door.offset] as [number, number], face: -Math.PI / 2 }
    case 'e':
      return { x: hw, z: door.offset, rotY: -Math.PI / 2, spawn: [hw - 2.2, door.offset] as [number, number], face: Math.PI / 2 }
  }
}
