import clsx from 'clsx'

export default function SectionLabel({ children, className, suffix }) {
  return (
    <p className={clsx('m-0 text-sm font-medium text-warm-text', className)}>
      {children}
      {suffix != null && (
        <span className="ml-2 font-normal text-warm-muted">{suffix}</span>
      )}
    </p>
  )
}
