export const InputStyle = "py-3 px-2 block w-full rounded-md border-gray-300 shadow-sm outline-offset-2 outline-blue-200";
export const WarningStyle = "block mb-4 text-red-500";
export function Input({ label, id, name, type, className, placeholder, onChange, value}) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block font-medium text-gray-700">{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                className={className}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}