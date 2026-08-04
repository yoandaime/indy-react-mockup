import { useMemo, useState } from "react"
import { Folder, FolderOpen, FolderPlus, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function collectFolderKeys(nodes, path, keys) {
  for (const node of nodes) {
    if (node.children?.length) {
      const key = [...path, node.name].join("/")
      keys.push(key)
      collectFolderKeys(node.children, [...path, node.name], keys)
    }
  }
  return keys
}

function CategoryNode({ node, path, depth, expandedKeys, onToggle, selectedPath, onSelect }) {
  const nextPath = [...path, node.name]
  const key = nextPath.join("/")
  const hasChildren = !!node.children?.length
  const isSelected = selectedPath === key
  const isExpanded = expandedKeys.has(key)

  return (
    <div className={depth > 0 ? "border-l border-border pl-2" : undefined}>
      <button
        type="button"
        onClick={() => onSelect(key)}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-neutral-700 hover:bg-muted",
          isSelected && "bg-[#fdecee] text-primary hover:bg-[#fdecee]"
        )}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(key)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.stopPropagation()
                onToggle(key)
              }
            }}
            className="shrink-0"
          >
            {isExpanded ? (
              <FolderOpen className={cn("size-4", isSelected ? "text-primary" : "text-neutral-500")} />
            ) : (
              <Folder className={cn("size-4", isSelected ? "text-primary" : "text-neutral-500")} />
            )}
          </span>
        ) : (
          <Hash className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-neutral-500")} />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <CategoryNode
              key={child.name}
              node={child}
              path={nextPath}
              depth={depth + 1}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryNav({
  tree,
  selectedPath,
  onSelectPath,
  onRequestCategory,
}) {
  const allFolderKeys = useMemo(() => collectFolderKeys(tree, [], []), [tree])
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(allFolderKeys))

  const allExpanded = allFolderKeys.length > 0 && allFolderKeys.every((k) => expandedKeys.has(k))

  const select = (key) => onSelectPath(selectedPath === key ? null : key)

  const toggleNode = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAll = () => {
    setExpandedKeys(allExpanded ? new Set() : new Set(allFolderKeys))
  }

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-3 overflow-hidden border-r bg-neutral-50 p-4">
      <Button
        variant="outline"
        size="sm"
        className="w-full shrink-0 shadow-xs"
        onClick={toggleAll}
      >
        {allExpanded ? "Collapse All" : "Expand All"}
        {allExpanded ? <FolderOpen className="size-3" /> : <Folder className="size-3" />}
      </Button>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {tree.map((node) => (
          <CategoryNode
            key={node.name}
            node={node}
            path={[]}
            depth={0}
            expandedKeys={expandedKeys}
            onToggle={toggleNode}
            selectedPath={selectedPath}
            onSelect={select}
          />
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full shrink-0 shadow-xs" onClick={onRequestCategory}>
        <FolderPlus className="size-4" />
        Request Kategori
      </Button>
    </aside>
  )
}
