import clsx from 'clsx'

const SIZE_CLASS = {
 default: 'md:max-w-[800px]',
 kanban: 'md:max-w-5xl',
}

export default function PageContainer({ children, size = 'default', className }) {
 return (
 <div
 className={clsx(
 'mx-auto w-full px-4 sm:px-6',
 SIZE_CLASS[size] ?? SIZE_CLASS.default,
 className,
 )}
 >
 {children}
 </div>
 )
}
