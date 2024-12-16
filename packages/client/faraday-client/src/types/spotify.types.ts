// TODO have shared between packages in a mono repo
/**
 * This file is a direct copy of a file same name from the api package
 */

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

  export type SpotifyPlaylist = {
    collaborative: false,
    description: string,
    external_urls: Record<string, any>,
    followers: {
      href: string,
      total: number
    },
    href: string,
    id: string,
    images:
      {
        url: string,
        height: number,
        width: number
       }[],
    name: string,
    owner: {
      "external_urls": {
        "spotify": "string"
      },
      "followers": {
        "href": "string",
        "total": 0
      },
      "href": "string",
      "id": "string",
      "type": "user",
      "uri": "string",
      "display_name": "string"
    },
    public: boolean,
    snapshot_id: string,
    tracks: Record<string, any>
    // tracks: {
    //   "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",
    //   "limit": 20,
    //   "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",
    //   "offset": 0,
    //   "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",
    //   "total": 4,
    //   "items": [
    //     {
    //       "added_at": "string",
    //       "added_by": {
    //         "external_urls": {
    //           "spotify": "string"
    //         },
    //         "followers": {
    //           "href": "string",
    //           "total": 0
    //         },
    //         "href": "string",
    //         "id": "string",
    //         "type": "user",
    //         "uri": "string"
    //       },
    //       "is_local": false,
    //       "track": {
    //         "album": {
    //           "album_type": "compilation",
    //           "total_tracks": 9,
    //           "available_markets": ["CA", "BR", "IT"],
    //           "external_urls": {
    //             "spotify": "string"
    //           },
    //           "href": "string",
    //           "id": "2up3OPMp9Tb4dAKM2erWXQ",
    //           "images": [
    //             {
    //               "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
    //               "height": 300,
    //               "width": 300
    //             }
    //           ],
    //           "name": "string",
    //           "release_date": "1981-12",
    //           "release_date_precision": "year",
    //           "restrictions": {
    //             "reason": "market"
    //           },
    //           "type": "album",
    //           "uri": "spotify:album:2up3OPMp9Tb4dAKM2erWXQ",
    //           "artists": [
    //             {
    //               "external_urls": {
    //                 "spotify": "string"
    //               },
    //               "href": "string",
    //               "id": "string",
    //               "name": "string",
    //               "type": "artist",
    //               "uri": "string"
    //             }
    //           ]
    //         },
    //         "artists": [
    //           {
    //             "external_urls": {
    //               "spotify": "string"
    //             },
    //             "href": "string",
    //             "id": "string",
    //             "name": "string",
    //             "type": "artist",
    //             "uri": "string"
    //           }
    //         ],
    //         "available_markets": ["string"],
    //         "disc_number": 0,
    //         "duration_ms": 0,
    //         "explicit": false,
    //         "external_ids": {
    //           "isrc": "string",
    //           "ean": "string",
    //           "upc": "string"
    //         },
    //         "external_urls": {
    //           "spotify": "string"
    //         },
    //         "href": "string",
    //         "id": "string",
    //         "is_playable": false,
    //         "linked_from": {
    //         },
    //         "restrictions": {
    //           "reason": "string"
    //         },
    //         "name": "string",
    //         "popularity": 0,
    //         "preview_url": "string",
    //         "track_number": 0,
    //         "type": "track",
    //         "uri": "string",
    //         "is_local": false
    //       }
    //     }
    //   ]
    // },
    type: string,
    uri: string
  }

  export type SpotifyAlbumTracksResponse = {
    href: string;
    items: Array<{
      artists: Array<{
        external_urls: {
          spotify: string;
        };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }>;
      disc_number: number;
      duration_ms: number;
      explicit: boolean;
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      is_local: boolean;
      is_playable: boolean;
      name: string;
      preview_url: string | null;
      track_number: number;
      type: string;
      uri: string;
    }>;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  
  export type SpotifyUserProfile = {
    display_name: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: Array<{ width: number, height: number, url: string}>; // Assuming images is an array that could hold objects or any type. Adjust if you know the specific structure.
    type: string;
    uri: string;
    followers: {
      href: string | null;
      total: number;
    };
    country: string;
    product: string;
    explicit_content: {
      filter_enabled: boolean;
      filter_locked: boolean;
    };
    email: string;
  };
  
  export type SpotifySearchResult = {
    artists: string[],
    href: string,
    id:  string,
    image: SearchResponse["albums"]["items"][number]["images"][number],
    name:  string,
    searchTerm:  string,
    type: 'album',
    uri:  string,
    isSoldOut: boolean,
    category?: string,
    popularity: number,
    price: string,
    releaseDate: string | undefined,
    albumType: string,
    totalTracks: number,
    genres: string[],
    trackList: {
      artists: SpotifyArtist[],
      duration_ms: number,
      id: string,
      name: string,
      preview_url: string,
      track_number: 1,
      type: string,
      uri: string,
    }[]
  }

  export type SpotifyArtist = {
    href: string, 
    id: string,
    name: string,
    type: string,
    uri: string
  }