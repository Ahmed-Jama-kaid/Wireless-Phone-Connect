WIRELESS PHONE CONNECT — BILOWGA (Python la'aan)

Waxa mashruucani hadda qabanayo:
- PC dashboard leh dark/light mode.
- QR code la abuuro lana soo dejiyo PNG.
- Telefoonku browser ayuu ku furaa QR link-ga, wuxuuna ku biiri karaa session-ka.
- PC-gu wuxuu muujinayaa Connected/Offline iyo magaca qalabka.
- Button Exit/Stop wuxuu yaallaa PC-ga.
- Waxa la tusayo waa status-ka isku-xidhka, MA AHA shaashadda Android-ka oo dhan.

Waxa loo baahan yahay:
1) Windows 10/11.
2) Node.js LTS (ma aha Python): https://nodejs.org/
3) Internet si npm packages loo soo dejiyo.

Sida loo bilaabo:
1) Ku rakib Node.js LTS.
2) Fur folder-kan.
3) Guji address bar-ka File Explorer, qor cmd, kadib Enter.
4) Geli: npm install
5) Geli: npm start
6) PC-ga ka fur: http://localhost:3000

MUHIIM:
- QR-ka localhost wuxuu ka shaqaynayaa PC-ga laftiisa oo keliya. Si telefoon meel kale ama Wi-Fi kale uga furo, mashruuca waa in lagu host-gareeyaa HTTPS public hosting, kadibna PUBLIC_URL loo dejiyo URL-ka.
- Hadda ma jiro live screen mirroring. Browser Android ma oggola in website caadi ahi si qarsoodi ah u akhriyo shaashadda ama apps-ka kale. Screen sharing wuxuu u baahan yahay hab uu Android-ku si cad u oggolaado; taageeradiisu way kala duwan tahay.
- Liiska qalabku waa prototype xusuusinaya xaaladda inta server-ku shaqaynayo. Production-ka, qalabka waa in database lagu kaydiyaa, laguna daraa authentication iyo session expiration.
- Ha gelin internetka public hosting ilaa authentication, HTTPS, rate limits iyo ilaalin dheeraad ah lagu daro.
