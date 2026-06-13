import clsx from 'clsx'

const SIZE_CLASS = {
 default: 'md:max-w-[800px]',
 wide: 'md:max-w-[1180px]',
 kanban: 'md:max-w-[1320px]',
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
