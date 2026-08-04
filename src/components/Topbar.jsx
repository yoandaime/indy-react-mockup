import { Link, useLocation } from "react-router-dom"
import indyLogo from "@/assets/indy-logo.svg"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Topbar() {
  const { pathname } = useLocation()
  const hideTitle = pathname === "/subscription" || pathname === "/" || pathname.startsWith("/ticketing")

  return (
    <header className="sticky top-0 z-[100] flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-10 shadow-sm">
      <Link
        to="/"
        className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.3px] text-foreground no-underline"
      >
        <img src={indyLogo} alt="INDY" className="h-6 w-auto" />
        {!hideTitle && (
          <>
            <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
            <span className="text-xs leading-4 font-normal text-neutral-600">
              Enrich Data Registration
            </span>
          </>
        )}
      </Link>

      <div className="flex items-center gap-2.5">
        <Avatar>
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <div className="text-left leading-tight">
          <div className="text-sm font-medium text-foreground">Antonio Nusa</div>
          <div className="text-xs text-muted-foreground">Admin</div>
        </div>
      </div>
    </header>
  )
}
