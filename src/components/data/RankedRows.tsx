import { Avatar } from '@mantine/core'
import { Link } from 'react-router-dom'
import { formatNumber } from '../../lib/format'
import classes from './data.module.css'

export interface RankedRow {
  name: string
  count: number
  href: string
  /** Omitted when the list is not in count order, where a rank would read as noise. */
  rank?: number
  photo?: string
}

interface RankedRowsProps {
  rows: RankedRow[]
  /** Largest count in the full set, so bars stay comparable across pages. */
  max: number
  unit: string
  avatars?: boolean
}

export const RankedRows = ({ rows, max, unit, avatars }: RankedRowsProps) => (
  <ol className={classes.rows}>
    {rows.map(row => (
      <li key={row.name}>
        <Link
          to={row.href}
          className={classes.row}
          data-noavatar={avatars ? undefined : true}
          aria-label={`${row.name}: ${formatNumber(row.count)} ${unit}${row.count === 1 ? '' : 's'}`}
        >
          <span className={classes.rank}>{row.rank}</span>
          {avatars && (
            <Avatar src={row.photo} name={row.name} color="initials" size={44} radius="xl" imageProps={{ loading: 'lazy' }} />
          )}
          <span className={classes.name}>{row.name}</span>
          <span className={classes.track} aria-hidden>
            <span className={classes.fill} style={{ width: `${(row.count / Math.max(max, 1)) * 100}%` }} />
          </span>
          <span className={classes.count}>{formatNumber(row.count)}</span>
        </Link>
      </li>
    ))}
  </ol>
)
