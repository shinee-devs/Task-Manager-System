import { DEADLINE_BADGE_STYLES, getTaskDeadlineLabel, PRIORITY_BADGE_STYLES, STATUS_BADGE_STYLES } from '../lib/taskUtils.js'

function TaskBadges({ priority, status, dueDate, className = '' }) {
  const deadline = getTaskDeadlineLabel({ status, due_date: dueDate })

  return (
    <div className={`flex min-w-0 flex-wrap gap-1.5 ${className}`}>
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-4 ${PRIORITY_BADGE_STYLES[priority] || PRIORITY_BADGE_STYLES.Medium}`}>{priority}</span>
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-4 ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES['To Do']}`}>{status}</span>
      {deadline && <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-4 ${DEADLINE_BADGE_STYLES[deadline]}`}>{deadline}</span>}
    </div>
  )
}

export default TaskBadges