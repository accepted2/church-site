import { useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import Button from "@/components/Button";

const Expandable = (props) => {
  const {
    children,
    className,
    collapsedHeight = 140,
    buttonClassName,
    collapsedLabel,
    expandedLabel,
  } = props

  const wrapperRef = useRef(null)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(collapsedHeight)

  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) {
      return
    }

    const update = () => {
      const fullHeight = contentRef.current.scrollHeight
      setIsOverflowing(fullHeight > collapsedHeight + 2)


    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()

  }, [children, collapsedHeight]);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) {
      return
    }
    const fullHeight = contentRef.current.scrollHeight
    setHeight(
      expanded
        ? fullHeight
        : collapsedHeight
    )
  }, [expanded, children, collapsedHeight])

  return (
    <>
      <div
        ref={wrapperRef}
        className={clsx('expandable', className)}
        style={{
          maxHeight: `${height}px`,
          transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          willChange: 'max-height',
        }}
      >
        <div ref={contentRef}>
          {children}

        </div>
      </div>

      {isOverflowing && (
        <Button
          className={clsx(
            buttonClassName,
            expanded && 'is-expanded'
          )}
          label={
            expanded
              ? collapsedLabel
              : expandedLabel
          }
          onClick={() => setExpanded(prev => !prev)}
          iconName="arrow-straight-left"
          iconPosition="after"

        />
      )}
    </>
  )
}

export default Expandable