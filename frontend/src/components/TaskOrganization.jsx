export default function TaskOrganization({ task, showEmpty = false }) {
  return <div className="mt-3 flex flex-wrap gap-2 text-xs">
    {(task.category || showEmpty) && <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-600">{task.category || 'Uncategorized'}</span>}
    {(task.tags || []).map((tag) => <span key={tag} className="max-w-full break-words rounded-full bg-accent-soft px-2 py-1 text-accent">#{tag}</span>)}
    {showEmpty && !task.tags?.length && <span className="py-1 text-muted">No tags</span>}
  </div>
}
