// Official publisher uploads, checked 2026-11-02. Embed only; no media is rehosted.
export const WILDLIFE_VIDEOS = [
  {
    youtubeId: '7DB1MdR_BiY',
    title: 'Through the Woodlands of Tadoba',
    description: 'Follow a sloth bear moving through dry grass and woodland in Tadoba National Park, Maharashtra.',
    credit: 'WildFilmsIndia',
    location: 'Tadoba, Maharashtra',
    category: 'Forest trails',
    duration: '3:09',
  },
  {
    youtubeId: 'XHcow-sJMAM',
    title: 'Foraging for Ants at Ranthambore',
    description: 'A sloth bear follows its nose across the dry landscape, digging into an insect mound in search of food.',
    credit: 'WildFilmsIndia',
    location: 'Ranthambore, Rajasthan',
    category: 'Foraging',
    duration: '1:29',
  },
  {
    youtubeId: 'fjcU3eys2A8',
    title: 'A Sloth Bear Family at Daroji',
    description: 'A bear family explores the rocky scrub forest of Daroji Sloth Bear Sanctuary, sharing its surroundings with peafowl.',
    credit: 'WildFilmsIndia',
    location: 'Daroji, Karnataka',
    category: 'Family life',
    duration: '2:40',
  },
  {
    youtubeId: 'qt8qjkQ8L9Q',
    title: 'Mother and Cubs at the Waterhole',
    description: 'A quiet moment as a mother sloth bear and her cubs stop for water. Filmed in India by Pugdundee Safaris; the exact reserve is not specified.',
    credit: 'Pugdundee Safaris',
    location: 'India · reserve unspecified',
    category: 'At the waterhole',
    duration: '0:41',
  },
].map(video => ({
  ...video,
  id: `wildlife-${video.youtubeId}`,
  poster: `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
  source: `https://www.youtube.com/watch?v=${video.youtubeId}`,
}));
