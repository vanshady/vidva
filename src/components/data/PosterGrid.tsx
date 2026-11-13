import { VisuallyHidden } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useState } from 'react'
import { PLEX_SERVER_ID, PlexMediaItem } from '../../services/plexService'
import { isWatched, plexImageUrl } from '../../lib/collection'
import classes from './data.module.css'

const plexWebUrl = (ratingKey: string) =>
  `https://app.plex.tv/desktop/#!/server/${PLEX_SERVER_ID}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`

const Poster = ({ item }: { item: PlexMediaItem }) => {
  const [failed, setFailed] = useState(false)
  const src = plexImageUrl(item.thumb, 240, 360)
  const watched = isWatched(item)
  return (
    <a href={plexWebUrl(item.ratingKey)} target="_blank" rel="noopener noreferrer" className={classes.poster}>
      <div className={classes.posterFrame}>
        {src && !failed
          ? <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
          : <div className={classes.posterFallback} aria-hidden>{item.title}</div>}
        {watched && (
          <span className={classes.watchedRibbon} aria-hidden>
            <IconCheck size={12} stroke={3} />
          </span>
        )}
      </div>
      <div className={classes.posterTitle}>{item.title}</div>
      <div className={classes.posterMeta}>{item.year ?? 'Year unknown'}</div>
      <VisuallyHidden>{watched ? '(watched, opens in Plex)' : '(opens in Plex)'}</VisuallyHidden>
    </a>
  )
}

export const PosterGrid = ({ items }: { items: PlexMediaItem[] }) => (
  <div className={classes.posters}>
    {items.map(item => <Poster key={item.ratingKey} item={item} />)}
  </div>
)
