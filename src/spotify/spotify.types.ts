export type SearchResponse = 
  {

    tracks: {
  
      href: string
  
      limit: number,
  
      next: string,
  
      offset: number,
  
      previous: string,
  
      total: number,
  
      items: [
  
        {
  
          album: {
  
            album_type: string,
  
            total_tracks: number,
  
            available_markets: string[],
  
            external_urls: {
  
              spotify: string
  
            },
  
            href: string,
  
            id: string,
  
            images: [
  
              {
  
                url: string,
  
                height: number,
  
                width: number
  
              }
  
            ],
  
            name: string,
  
            release_date: string,
  
            release_date_precision: string,
  
            restrictions: {
  
              reason: string
  
            },
  
            type: "album",
  
            uri: string,
  
            copyrights: [
  
              {
  
                text: string,
  
                type: string
  
              }
  
            ],
  
            external_ids: {
  
              isrc: string,
  
              ean: string,
  
              upc: string
  
            },
  
            genres: string[],
  
            label: string,
  
            popularity: number,
  
            album_group: string,
  
            artists: [
  
              {
  
                external_urls: {
  
                  spotify: string
  
                },
  
                href: string,
  
                id: string,
  
                name: string,
  
                type: "artist",
  
                uri: string
  
              }
  
            ]
  
          },
  
          artists: [
  
            {
  
              external_urls: {
  
                spotify: string
  
              },
  
              followers: {
  
                href: string,
  
                total: number
  
              },
  
              genres: string[],
  
              href: string,
  
              id: string,
  
              images: [
  
                {
  
                  url: string,
  
                  height: number,
  
                  width: number
  
                }
  
              ],
  
              name: string,
  
              popularity: number,
  
              type: "artist",
  
              uri: string
  
            }
  
          ],
  
          available_markets: string[],
  
          disc_number: number,
  
          duration_ms: number,
  
          explicit: string,
  
          external_ids: {
  
            isrc: string,
  
            ean: string,
  
            upc: string
  
          },
  
          external_urls: {
  
            spotify: string
  
          },
  
          href: string,
  
          id: string,
  
          is_playable: string,
  
          linked_from: {},
  
          restrictions: {
  
            reason: string
  
          },
  
          name: string,
  
          popularity: number,
  
          preview_url: string,
  
          track_number: number,
  
          type: "track",
  
          uri: string,
  
          is_local: string
  
        }
  
      ]
  
    },
  
    artists: {
  
      href: string,
  
      limit: number,
  
      next: string,
  
      offset: number,
  
      previous: string,
  
      total: number,
  
      items: [
  
        {
  
          external_urls: {
  
            spotify: string
  
          },
  
          followers: {
  
            href: string,
  
            total: number
  
          },
  
          genres: string[],
  
          href: string,
  
          id: string,
  
          images: [
  
            {
  
              url: string,
  
              height: number,
  
              width: number
  
            }
  
          ],
  
          name: string,
  
          popularity: number,
  
          type: "artist",
  
          uri: string
  
        }
  
      ]
  
    },
  
    albums: {
  
      href: string,
  
      limit: number,
  
      next: string,
  
      offset: number,
  
      previous: string,
  
      total: number,
  
      items: [
  
        {
  
          album_type: string,
  
          total_tracks: number,
  
          available_markets: string[],
  
          external_urls: {
  
            spotify: string
  
          },
  
          href: string,
  
          id: string,
  
          images: [
  
            {
  
              url: string,
  
              height: number,
  
              width: number
  
            }
  
          ],
  
          name: string,
  
          release_date: string,
  
          release_date_precision: string,
  
          restrictions: {
  
            reason: string
  
          },
  
          type: "album",
  
          uri: string,
  
          copyrights: [
  
            {
  
              text: string,
  
              type: string
  
            }
  
          ],
  
          external_ids: {
  
            isrc: string,
  
            ean: string,
  
            upc: string
  
          },
  
          genres: string[],
  
          label: string,
  
          popularity: number,
  
          album_group: string,
  
          artists: [
  
            {
  
              external_urls: {
  
                spotify: string
  
              },
  
              href: string,
  
              id: string,
  
              name: string,
  
              type: "artist",
  
              uri: string
  
            }
  
          ]
  
        }
  
      ]
  
    },
  
  }