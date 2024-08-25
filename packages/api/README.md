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