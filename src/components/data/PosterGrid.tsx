import { VisuallyHidden } from '@mantine/core'
import { useState } from 'react'
import { PLEX_SERVER_ID, PlexMediaItem } from '../../services/plexService'
import { plexImageUrl } from '../../lib/collection'
import classes from './data.module.css'

const plexWebUrl = (ratingKey: string) =>
  `https://app.plex.tv/desktop/#!/server/${PLEX_SERVER_ID}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`

const Poster = ({ item }: { item: PlexMediaItem }) => {
  const [failed, setFailed] = useState(false)
  const src = plexImageUrl(item.thumb, 240, 360)
  return (
    <a href={plexWebUrl(item.ratingKey)} target="_blank" rel="noopener noreferrer" className={classes.poster}>
      <div className={classes.posterFrame}>
        {src && !failed
          ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
          : <div className={classes.posterFallback} aria-hidden>{item.title}</div>}
      </div>
      <div className={classes.posterTitle}>{item.title}</div>
      <div className={classes.posterMeta}>{item.year ?? 'Year unknown'}</div>
      <VisuallyHidden>(opens in Plex)</VisuallyHidden>
    </a>
  )
}

export const PosterGrid = ({ items }: { items: PlexMediaItem[] }) => (
  <div className={classes.posters}>
    {items.map(item => <Poster key={item.ratingKey} item={item} />)}
  </div>
)
