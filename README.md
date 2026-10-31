# JANGMAYDON — O‘zbekcha Battle Royale (Demo 0.1)

Brauzerda ishlaydigan 3D sinov o‘yini: o‘yinchi, 11 bot, jihoz yig‘ish, jon, mini-xarita, kichrayadigan xavfsiz zona va o‘zbekcha interfeys.

## Ishga tushirishning eng oson yo‘li: GitHub Pages
1. ZIP arxivni oching.
2. GitHub'da **New repository** yarating, masalan `jangmaydon-demo`.
3. `index.html` va `src/game.js` fayllarini repository'ga yuklang. Papka tuzilishini saqlang.
4. Repository → **Settings → Pages** → **Deploy from a branch** → `main` va `/ (root)` ni tanlang → Save.
5. Bir necha daqiqadan so‘ng Pages ko‘rsatgan saytda o‘yin ochiladi.

> Three.js modulini CDN'dan yuklaydi, shu sabab internet kerak. GitHub Pages statik hosting uchun qulay.

## Mahalliy kompyuterda ishga tushirish
ES module sabab `index.html` faylini ikki marta bosib ochish ba’zi brauzerlarda ishlamasligi mumkin. Papkada terminal oching va:
```bash
python -m http.server 8000
```
So‘ng brauzerda `http://localhost:8000` ni oching.

## Boshqaruv
### Kompyuter
- **W A S D** — yurish
- **Shift** — yugurish
- **Space** — sakrash
- **Sichqoncha** — kamerani burish / nishon
- **Sichqoncha chap tugmasi** — otish
- **E** — yaqin jihozni olish

### Telefon / planshet
- Chapdagi joystik — yurish
- Ekranning o‘ng tomonini surish — kamerani burish
- **OTISH**, **SAKRASH**, **YUGURISH** tugmalari
- Jihoz yonida **E** klaviatura yo‘qligi sabab hozircha avtomatik pickup yo‘q; demo boshqaruvi keyingi versiyada yaxshilanadi.

## Demo chegaralari
- Bu bir qurilmada ishlaydigan botli demo, internet orqali ko‘p o‘yinchili multiplayer emas.
- PUBG'ning rasmiy aktivlari yoki xaritasi ishlatilmagan; o‘ziga xos prototip.
- Botlar sodda AI bilan yuradi va yaqinlashib zarar beradi.
- Ovoz, haqiqiy qurol animatsiyasi, inventar oynasi, transport, server, hisoblar va anti-cheat kiritilmagan.
- Uch o‘lchamli muhit procedural ravishda kod bilan yaratiladi; ko‘rinish qurilma quvvatiga qarab farq qilishi mumkin.

## Fayllar
- `index.html` — menyu, HUD, minimap, responsive/touch tugmalar
- `src/game.js` — Three.js 3D sahna, o‘yinchi, botlar, loot, otish va zona

## GitHub'ga terminal orqali yuklash
```bash
git init
git add .
git commit -m "Create JangMaydon browser demo"
git branch -M main
git remote add origin https://github.com/USERNAME/jangmaydon-demo.git
git push -u origin main
```
`USERNAME` o‘rniga o‘z GitHub nomingizni yozing.
