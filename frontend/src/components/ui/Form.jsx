export default function Form({ children, className = '', ...props }) {
  return (
    <form className={['space-y-4', className].join(' ')} {...props}>
      {children}
    </form>
  )
}
