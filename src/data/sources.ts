export type Source = { label: string; url: string }

export const SOURCES = {
  nnm: { label: 'museums.or.ke · Nairobi National Museum', url: 'https://museums.or.ke/nairobi-national-museum/' },
  nmk: { label: 'nmk.go.ke · Nairobi National Museum', url: 'https://nmk.go.ke/nairobi-national-museum/' },
  snake: { label: 'museums.or.ke · Nairobi Snake Park and Aquarium', url: 'https://museums.or.ke/nairobi-snake-park-and-aquarium/' },
  rates: { label: 'NMK revised admission fees, May 2026 (PDF)', url: 'https://museums.or.ke/wp-content/uploads/2026/04/Revision-of-NMK-admission-fees-2026-Website.pdf' },
  blavals: { label: 'Blavals · National Museum Society of Kenya guide', url: 'https://www.blavals.com/destination/national-museum-society-of-kenya' },
  olesereni: { label: 'Ole Sereni · 9 must-see galleries', url: 'https://emara.ole-sereni.com/9-must-see-galleries-at-nairobi-national-museum-of-kenya/' },
  kms: { label: 'Kenya Museum Society · Joy Adamson exhibition', url: 'https://www.kenyamuseumsociety.org/official-opening-of-the-joy-adamson-exhibition-at-nairobi-national-museum/' },
  kgeo: { label: 'Kenya Geographic · 5 things to do at the museum', url: 'https://www.kenyageographic.com/5-things-to-do-at-the-nairobi-national-museum/' },
  guide: { label: 'Done Adventures · National Museum visitor guide', url: 'https://doneadventures.com/destinations/kenya-destination/national-museum/' },
  reviews: { label: 'Google reviews via Nairobi Breaks', url: 'https://www.nairobibreaks.com/city/nairobi/nairobi-national-museum' },
  photo: { label: 'Described from the NMK photograph of this space', url: 'https://museums.or.ke/nairobi-national-museum/' },
  background: { label: 'Background note (general history, not museum wall text)', url: 'https://museums.or.ke/nairobi-national-museum/' },
} satisfies Record<string, Source>

export const PHOTO_CREDIT = 'Photo: National Museums of Kenya (museums.or.ke / nmk.go.ke)'
export const ILLUSTRATIVE_CREDIT = 'Illustrative image generated for this tour, not a photograph of the exhibit'

export const MUSEUM = {
  name: 'Nairobi National Museum',
  swahili: 'Makumbusho ya Kitaifa ya Nairobi',
  address: 'Museum Hill, Kipande Road · P.O. Box 40658-00100, Nairobi',
  hours: 'Open daily 8:30 am – 5:30 pm, including weekends and public holidays',
  nightTours: 'Night tours 6 – 10 pm for booked groups of 10 or more',
  rating: '4.5 on Google · about 11,900 reviews',
  phone: '+254 721 308 485',
  email: 'publicrelations@museums.or.ke',
  payment: 'No cash. Tickets are paid through eCitizen (nmkpay.ecitizen.go.ke).',
  tickets: [
    { label: 'Museum · adult', citizen: 'KSh 350', resident: 'US$ 9', foreign: 'US$ 18' },
    { label: 'Museum · child', citizen: 'KSh 200', resident: 'US$ 6', foreign: 'US$ 9' },
    { label: 'Snake Park · adult', citizen: 'KSh 350', resident: 'US$ 6', foreign: 'US$ 18' },
    { label: 'Snake Park · child', citizen: 'KSh 200', resident: 'US$ 3', foreign: 'US$ 9' },
    { label: 'Combined · adult', citizen: 'KSh 600', resident: 'US$ 15', foreign: 'US$ 25' },
    { label: 'Combined · child', citizen: 'KSh 300', resident: 'US$ 10', foreign: 'US$ 15' },
  ],
}
