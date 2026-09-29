import { DEADLINE_BADGE_STYLES, getTaskDeadlineLabel } from '../lib/taskUtils.js'

export default function TaskBadges({ status, dueDate, dueTime, className = '' }) {
  const deadline = getTaskDeadlineLabel({ status, due_date: dueDate, due_time: dueTime })
  if (!deadline) return null
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${DEADLINE_BADGE_STYLES[deadline]} ${className}`}>{deadline}</span>
}
