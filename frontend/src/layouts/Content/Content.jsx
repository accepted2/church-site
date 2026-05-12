import './Content.scss'
import clsx from "clsx";

const Content = (props) => {
  const {
    className,
    children,
  } = props

  return (
    <main
      className={clsx(className, 'content')}
    >
      Content
      {children}
    </main>
  )
}

export default Content