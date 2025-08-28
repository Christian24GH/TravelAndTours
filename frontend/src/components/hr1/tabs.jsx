import { useState } from "react"

export default function Tabs({ tabs = [] }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg ${
              i === active ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  )
}
