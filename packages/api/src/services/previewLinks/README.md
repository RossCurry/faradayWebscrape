# Get Preview links

Spotify have removed the preview link from their API. They now return `null` for everything.

A cool part of my app was that we could use the `preview_url` to listen in the App.

There is a package `spotify-preview-finder` that has a solution.

The package has a lot of code we don't need. So this service is going to be a stripped down version of that one.

`spotify-preview-finder` use the ` track.external_urls.spotify` field from a track data to find the cdn link.

This service will just take those links from the mongo service and return valid cdn links for each one. Hopefully.

