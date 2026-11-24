import {
  BadgeCheck,
  Building2,
  Clock,
  CreditCard,
  Download,
  FolderOpen,
  House,
  Landmark,
  Layers,
  type LucideIcon,
  Mail,
  MessageSquareWarning,
  RefreshCw,
  Tag,
  Users,
} from "lucide-react"

/** Keys of counters shown as badges next to nav items (filled by the shell). */
export type NavBadgeKey = "imfPending" | "unreadMessages"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  /** Short description used by the global search and module placeholders. */
  description: string
  badge?: { key: NavBadgeKey; tone: "warning" | "brand" }
  /** Extra words that should match in the global search. */
  keywords?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: "Aperçu",
    items: [
      {
        title: "Tableau de bord",
        href: "/",
        icon: House,
        description: "Vue d'ensemble de la plateforme",
        keywords: ["accueil", "dashboard", "kpi"],
      },
    ],
  },
  {
    label: "Clients",
    items: [
      {
        title: "Entreprises",
        href: "/companies",
        icon: Building2,
        description: "Entreprises clientes, activation et détails",
        keywords: ["groupes", "sociétés", "companies"],
      },
      {
        title: "Paiements",
        href: "/payments",
        icon: CreditCard,
        description: "Historique des transactions et opérateurs",
        keywords: ["transactions", "mobile money", "orange", "mpesa", "airtel"],
      },
      {
        title: "Abonnements",
        href: "/subscriptions",
        icon: RefreshCw,
        description: "Abonnements actifs, essais et expirations",
        keywords: ["souscriptions", "prolonger", "expiration", "essai"],
      },
      {
        title: "Plans",
        href: "/plans",
        icon: Layers,
        description: "Offres, tarifs et limites",
        keywords: ["tarifs", "offres", "prix"],
      },
      {
        title: "Codes promo",
        href: "/promo-codes",
        icon: Tag,
        description: "Réductions et campagnes",
        keywords: ["réduction", "coupon", "promo"],
      },
    ],
  },
  {
    label: "Gestion IMF",
    items: [
      {
        title: "En attente",
        href: "/imf/pending",
        icon: Clock,
        description: "Demandes IMF à examiner",
        badge: { key: "imfPending", tone: "warning" },
        keywords: ["imf", "microfinance", "demandes"],
      },
      {
        title: "Approuvés",
        href: "/imf/approved",
        icon: Landmark,
        description: "Institutions de microfinance approuvées",
        keywords: ["imf", "microfinance"],
      },
      {
        title: "Valider un groupe",
        href: "/imf/validate",
        icon: BadgeCheck,
        description: "Approuver un groupe IMF par identifiant",
        keywords: ["imf", "approbation"],
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        title: "Réclamations",
        href: "/claims",
        icon: MessageSquareWarning,
        description: "Réclamations des clients",
        keywords: ["tickets", "plaintes", "claims"],
      },
      {
        title: "Utilisateurs",
        href: "/users",
        icon: Users,
        description: "Comptes et rôles",
        keywords: ["comptes", "rôles", "admin"],
      },
    ],
  },
  {
    label: "Site web",
    items: [
      {
        title: "Messages",
        href: "/messages",
        icon: Mail,
        description: "Messages de contact ventes et support",
        badge: { key: "unreadMessages", tone: "brand" },
        keywords: ["contact", "ventes", "support"],
      },
      {
        title: "Bibliothèque",
        href: "/documents",
        icon: FolderOpen,
        description: "Documents téléchargeables du site",
        keywords: ["documents", "fichiers", "pdf"],
      },
      {
        title: "Leads",
        href: "/document-leads",
        icon: Download,
        description: "Téléchargements de documents",
        keywords: ["prospects", "téléchargements", "leads"],
      },
    ],
  },
]

export const navItems: NavItem[] = navigation.flatMap((group) => group.items)

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Resolves the nav group and item for the current path (for titles & breadcrumbs). */
export function findNavMatch(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navigation) {
    for (const item of group.items) {
      if (isNavItemActive(pathname, item.href)) return { group, item }
    }
  }
  return null
}
