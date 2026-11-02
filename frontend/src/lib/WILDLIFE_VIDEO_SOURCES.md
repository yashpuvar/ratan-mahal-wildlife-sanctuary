# Sloth bear film sources

Verified on 2026-11-02 against the publishers' YouTube watch-page metadata. Each returned playability status `OK`, `playableInEmbed: true`, and availability in India (`IN`). Each max-resolution thumbnail returned HTTP 200 with `image/jpeg`.

Live Chromium checks also confirmed actual playback for all four embedded videos: the media clock advanced beyond three seconds with `paused: false` and `readyState: 4` after explicitly starting playback. The waterhole clip required a second explicit play command in the verification browser after its first attempt remained cued. These checks are separate from the automated UI tests, which simulate player success/failure without relying on third-party streaming.

| Film | Official upload | Publisher | Duration | Location reported by publisher |
| --- | --- | --- | --- | --- |
| Through the Woodlands of Tadoba | https://www.youtube.com/watch?v=7DB1MdR_BiY | WildFilmsIndia | 3:09 | Tadoba National Park, Maharashtra |
| Foraging for Ants at Ranthambore | https://www.youtube.com/watch?v=XHcow-sJMAM | WildFilmsIndia | 1:29 | Ranthambore National Park, Rajasthan |
| A Sloth Bear Family at Daroji | https://www.youtube.com/watch?v=fjcU3eys2A8 | WildFilmsIndia | 2:40 | Daroji Sloth Bear Sanctuary, Karnataka |
| Mother and Cubs at the Waterhole | https://www.youtube.com/watch?v=qt8qjkQ8L9Q | Pugdundee Safaris | 0:41 | India; exact reserve not specified |

WildFilmsIndia channel: `UCixvwLpO_pk4uVOkkkqP3Mw`. Pugdundee Safaris channel: `UCVrGjfeX9MXhUhksF9w2ZBA`.

These copyrighted films are used only through the official, embedding-enabled YouTube player. No Creative Commons or download/rehosting rights are claimed. No video files are copied or stored in this project. WildFilmsIndia separately offers broadcast-footage licensing; that is not a license to download these uploads.

The page loads publisher-provided thumbnails from `i.ytimg.com`, and loads the player API only after a user selects a film. Players use `youtube-nocookie.com`, show the original controls and fullscreen option, and do not autoplay. A permanent link to the original upload remains available if the publisher later removes the film, restricts embedding, or playback is blocked. Third-party availability and regional restrictions can change.

None of these films is presented as footage from Ratan Mahal. The existing API collection and original Pexels fallback clips remain in their existing section. Curated films are frontend content; database records and admin routes are unchanged.

Player guidance: https://support.google.com/youtube/answer/171780 and https://developers.google.com/youtube/iframe_api_reference.
