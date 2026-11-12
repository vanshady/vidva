import { Link } from 'react-router-dom'
import { formatNumber } from '../../lib/format'
import classes from './data.module.css'

interface DecadeBarsProps {
  data: { name: string; count: number }[]
  hrefFor: (name: string) => string
  unit: string
}

/** Decades in year order, each column a link to the titles from that decade. */
export const DecadeBars = ({ data, hrefFor, unit }: DecadeBarsProps) => {
  const max = Math.max(1, ...data.map(d => d.count))
  // Past ten columns, abbreviate to '30s; century decades keep their full name
  // so 1900s and 2000s never share the label '00s.
  const label = (name: string) =>
    data.length > 10 && !name.endsWith('00s') ? `’${name.slice(2)}` : name
  return (
    <div className={classes.decades}>
      {data.map(d => (
        <Link
          key={d.name}
          to={hrefFor(d.name)}
          className={classes.decade}
          aria-label={`${d.name}: ${formatNumber(d.count)} ${unit}${d.count === 1 ? '' : 's'}`}
        >
          <span className={classes.decadeCount}>{formatNumber(d.count)}</span>
          <span className={classes.decadeBar} style={{ height: `${(d.count / max) * 78}%` }} />
          <span className={classes.decadeLabel}>{label(d.name)}</span>
        </Link>
      ))}
    </div>
  )
}
