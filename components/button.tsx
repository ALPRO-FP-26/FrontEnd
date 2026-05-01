import Link from "next/link"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href"> {
  href?: string
  icon?: ReactNode
  className?: string
  bgClass?: string
  hoverClass?: string
  children?: ReactNode
}

const baseButtonStyles = "min-w-12 min-h-12 rounded-full flex items-center justify-center transition-colors duration-500 border-3 border-background"
const defaultBgClass = "bg-gray-300 text-foreground/70"
const defaultHoverClass = "hover:bg-richcerulean hover:text-background"

export default function Button({ href, icon, children, className = "", bgClass, hoverClass, ...props }: ButtonProps) {
  const classNames = [baseButtonStyles, bgClass ?? defaultBgClass, hoverClass ?? defaultHoverClass, className].filter(Boolean).join(" ")

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children ?? icon}
      </Link>
    )
  }

  return (
    <button className={classNames} {...props}>
      {children ?? icon}
    </button>
  )
}

