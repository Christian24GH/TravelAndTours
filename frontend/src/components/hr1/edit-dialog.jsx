import { useState } from "react"

export default function UpdateDialog({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="px-2 py-1 text-sm bg-yellow-500 text-white rounded-md"
        onClick={() => setOpen(true)}
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit {item.name}</h2>
            <form className="flex flex-col gap-2">
              <input defaultValue={item.name} className="border p-2 rounded" />
              <input defaultValue={item.email} className="border p-2 rounded" />
              <input defaultValue={item.position} className="border p-2 rounded" />
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                Update
              </button>
            </form>
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
