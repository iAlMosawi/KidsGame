# Recorded sounds (optional)

Many computers and phones have no Arabic voice, so the 🔈 buttons and the
"استمع واختر" (listen and choose) topic can't read Arabic aloud on them.
To fix this on every device, add your own recordings:

1. Record each sound as an `.mp3` file, named **exactly** like the text the game says.
   For the letter names: `ألف.mp3`, `باء.mp3`, `تاء.mp3`, `ثاء.mp3`, `جيم.mp3`, `حاء.mp3`, `خاء.mp3`,
   `دال.mp3`, `ذال.mp3`, `راء.mp3`, `زاي.mp3`, `سين.mp3`, `شين.mp3`, `صاد.mp3`, `ضاد.mp3`, `طاء.mp3`,
   `ظاء.mp3`, `عين.mp3`, `غين.mp3`, `فاء.mp3`, `قاف.mp3`, `كاف.mp3`, `لام.mp3`, `ميم.mp3`, `نون.mp3`,
   `هاء.mp3`, `واو.mp3`, `ياء.mp3`.
   You can also record words, for example `أسد.mp3` and `بطة.mp3`.
2. Put the files in `audio/ar/` (or `audio/en/` for English).
3. Add each name, without `.mp3`, to the list in `audio/manifest.js`, for example: `ar: ['ألف', 'باء', 'تاء'],`

The game then plays your recording instead of the device's voice.
