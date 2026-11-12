import { Anchor, Title } from '@mantine/core'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import classes from './data.module.css'

interface SectionCardProps {
  title: string
  /** Secondary text beside the title, e.g. a total. */
  meta?: ReactNode
  action?: { label: string; to: string }
  controls?: ReactNode
  children: ReactNode
  className?: string
}

export const SectionCard = ({ title, meta, action, controls, children, className }: SectionCardProps) => (
  <section className={`${classes.card} ${className ?? ''}`} aria-label={title}>
    <header className={classes.cardHead}>
      <Title order={2}>{title}</Title>
      {meta}
      {controls}
      {action && (
        <Anchor component={Link} to={action.to} className={classes.cardAction}>{action.label}</Anchor>
      )}
    </header>
    {children}
  </section>
)

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  to?: string
}

export const StatCard = ({ label, value, sub, to }: StatCardProps) => {
  const body = (
    <>
      <div className={classes.statLabel}>{label}</div>
      <div className={classes.statValue}>{value}</div>
      {sub && <div className={classes.statSub}>{sub}</div>}
    </>
  )
  return to
    ? <Link to={to} className={classes.stat}>{body}</Link>
    : <div className={classes.stat}>{body}</div>
}
