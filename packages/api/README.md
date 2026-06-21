# Faraday scrape & Spotiy api

## Routes to call

Call these routes in this order to update the DB with Faraday & corresponding Spotify data

### update faraday albums

`post("/api/faraday/albums"`

### update spotify albums

`post("/api/spotify/albums`

### update spotify tracks

`post("/api/spotify/tracks`


# TODOS

I have to fix the album search for spotify.
I currently always hit the limit.
Will prob have to do the same for track info


Puppeteer: on a vps image likely missing these apps

```
sudo apt-get update
sudo apt-get install -y \
  ca-certificates fonts-liberation \
  libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 \
  libcairo2 libcups2t64 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 \
  libgbm1 libglib2.0-0t64 libgtk-3-0t64 libnspr4 libnss3 \
  libpango-1.0-0 libpangocairo-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6
```