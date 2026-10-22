# Tuányuán / 团圆

*The moon is always whole. We only experience it in phases.*

Tuányuán is a small interactive film for the Mid-Autumn Festival. You find the moon you were born under, sit with four questions as it fills with light, and at the end open a lacquer box to find a mooncake pressed with your moon, to keep or to send.

团圆 (tuányuán) means both *roundness* and *reunion*. The festival's full moon is the shape of a family gathered together, and the experience is built around that idea: wholeness is not something you become, it is something you were all along.

## The journey

1. **Opening.** Lotus lanterns drift on dark water until the title surfaces.
2. **The moon is always whole.** A circle of twelve phases, revealed one by one.
3. **When and where did you arrive?** Date, time and place of birth. The time zone is found from the place.
4. **Your moon.** The phase and sign of the Moon at the moment you were born, set in a circle you can move through by hand.
5. **Four phases.** One question for each quarter of the moon. Each answer lights a quarter of the ring.
6. **Whole.** A silence, then: *You weren't becoming whole. You were whole all along.* A short reflection is written from your own words.
7. **The box.** Autumn leaves, a lacquer box, a lid that catches before it gives, and six mooncakes. One of them is yours.
8. **Keep or send.** A keepsake image with 团圆, your moon, a line of your own, and *Under the same moon.*

## How it works

Everything except the closing reflection runs in the visitor's browser.

- **The Moon.** Phase and ecliptic longitude are calculated with [Astronomy Engine](https://github.com/cosinekitty/astronomy) at the exact moment of birth. The zodiac sign follows from the longitude. This is deterministic: the same birth details always give the same moon.
- **Place and time zone.** The place of birth is matched against a list of about 7,300 cities built into the page, giving coordinates and an IANA time zone. The browser's own time zone data then handles historical daylight saving (for example, China's summer time of 1986 to 1991). Nothing is looked up online.
- **The reflection.** The visitor's answers, with the phase and sign already calculated, are sent to `api/reflect.js`, which asks Anthropic's Claude API for a short reflection in the visitor's own words. The AI never calculates anything astronomical. Without an API key, or if the request fails, the page shows the visitor's own words instead.
- **The visuals.** The lotus river, the moons, the room, the silk, the box, the mooncakes and the leaves are all drawn in code on canvas, with a WebGL pass for the water. There are no image files.
- **Nothing is stored.** No accounts, cookies, analytics or browser storage. "Keep this moon" saves an image to the visitor's device.

## Project structure

```
index.html        the whole experience: markup, styles and scripts in one page
api/reflect.js    serverless function that writes the closing reflection
vercel.json       Vercel settings for the function and security headers
```

## Deploying on Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new). Leave the framework preset as **Other**; there is no build step.
2. In **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with a key from [console.anthropic.com](https://console.anthropic.com).
3. Redeploy so the function picks up the key.

Optional: set `ANTHROPIC_MODEL` to use a different Claude model (the default is `claude-sonnet-5`).

Each reflection is one short API request billed to the key's account, so set a monthly spend limit in the Anthropic Console.

## Running locally

Any static server works for the page itself:

```
npx serve .
```

The reflection needs the function, so use the Vercel CLI to run both together:

```
npx vercel dev
```

## Accessibility

Designed with WCAG 2.2 AA as the reference, though not formally audited. Every action works with a keyboard, the circle of phases moves with the arrow keys, Chinese text is marked as Chinese for screen readers, and with *reduce motion* turned on the animations settle immediately. The Accessibility page inside the experience lists what is in place and the known limitations.

## Credits

- Concept, writing, design and interface: Elizabeth Xu
- Lunar calculation: [Astronomy Engine](https://github.com/cosinekitty/astronomy) by Don Cross, MIT License
- City and time zone data: derived from [city-timezones](https://github.com/kevinroberts/city-timezones), MIT License
- Typefaces: Bodoni Moda, Newsreader, Jost, Noto Serif SC and ZCOOL XiaoWei, via Google Fonts, SIL Open Font License
- Closing line: 但愿人长久，千里共婵娟, from *Shuidiao Getou* by Su Shi (1076)

## License

© 2026 Elizabeth Xu. All rights reserved.

The code and content in this repository are shared to show how the experience was made. Please don't republish or reuse them without permission. The third-party libraries, data and typefaces listed above remain under their own licenses.
