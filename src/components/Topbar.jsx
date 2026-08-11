import { ChevronDown, User, ShieldCheck, MessagesSquare, LogOut } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import indyLogo from "@/assets/indy-logo.svg"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const hideTitle = pathname === "/subscription" || pathname === "/" || pathname.startsWith("/ticketing")
  const inTicketing = pathname.startsWith("/ticketing")
  const inAdminCenter = pathname.startsWith("/ticketing/admin")

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
        {inAdminCenter && (
          <button
            type="button"
            onClick={() => navigate("/ticketing")}
            className="mr-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-foreground"
          >
            <MessagesSquare className="size-4" />
            Back to Forum
          </button>
        )}

        {inTicketing ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md outline-none">
              <Avatar>
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              <div className="text-left leading-tight">
                <div className="text-sm font-medium text-foreground">Antonio Nusa</div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Antonio Nusa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  My Profile
                </DropdownMenuItem>
                {inAdminCenter ? (
                  <DropdownMenuItem onClick={() => navigate("/ticketing")}>
                    <MessagesSquare />
                    Back to Forum
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/ticketing/admin")}>
                    <ShieldCheck />
                    Admin Control Center
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOut />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1.5 rounded-md">
            <Avatar>
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <div className="text-left leading-tight">
              <div className="text-sm font-medium text-foreground">Antonio Nusa</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
