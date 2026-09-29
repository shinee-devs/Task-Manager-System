function Tasks() {
  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[#728076]">Your workspace</p>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em]">My tasks</h1>
      </div>
      <div className="rounded-xl border border-[#e6e9e4] bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-bold">No tasks to show</h2>
        <p className="mt-2 text-sm text-[#7b847c]">The task list will be connected to the API in a later phase.</p>
      </div>
    </div>
  )
}

export default Tasks