const summary = [
  { label: 'Open tasks', value: '0', tone: 'text-[#27613d]', mark: 'bg-[#dceee0]' },
  { label: 'Due today', value: '0', tone: 'text-[#a45a32]', mark: 'bg-[#f8e7da]' },
  { label: 'Completed', value: '0', tone: 'text-[#4f657c]', mark: 'bg-[#e3eaf0]' },
]

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#728076]">Tuesday, September 29</p>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em]">Good morning</h1>
          <p className="mt-2 text-sm text-[#7b847c]">A little progress goes a long way.</p>
        </div>
        <button type="button" disabled className="cursor-not-allowed rounded-lg bg-[#28623e] px-4 py-2.5 text-sm font-semibold text-white opacity-60">
          + New task
        </button>
      </div>

      <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-3">
        {summary.map((item) => (
          <article key={item.label} className="flex items-center gap-4 rounded-xl border border-[#e6e9e4] bg-white p-5">
            <span className={`grid size-10 place-items-center rounded-lg ${item.mark}`}>
              <span className={`size-2.5 rounded-full ${item.tone.replace('text-', 'bg-')}`} />
            </span>
            <div>
              <p className="text-sm text-[#7b847c]">{item.label}</p>
              <p className={`mt-0.5 font-[Manrope] text-2xl font-bold ${item.tone}`}>{item.value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-[#e6e9e4] bg-white px-6 py-10 text-center sm:py-14">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf4ee] text-[#28623e]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current" strokeWidth="1.6">
            <path d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v13.25L12 16l-7.25 4.25V7A2.25 2.25 0 0 1 7 4.75Z" strokeLinejoin="round" />
            <path d="M9 9h6M9 12h4" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="mt-4 text-lg font-bold">Your day starts here</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#7b847c]">Your dashboard is ready. Task creation and activity will arrive in the next phase.</p>
      </section>
    </div>
  )
}

export default Dashboard