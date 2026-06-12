import clsx from 'clsx'

export default function SectionLabel({ children, className, suffix }) {
 return (
 <p className={clsx('m-0 text-sm font-medium text-ink', className)}>
 {children}
 {suffix != null && (
 <span className="ml-2 font-normal text-ink-muted">{suffix}</span>
 )}
 </p>
 )
}
