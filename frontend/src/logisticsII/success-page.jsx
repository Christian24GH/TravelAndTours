import { motion } from "motion/react"
export default function SuccessPage(){
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
        >
            <div className="flex flex-col items-center justify-center">
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="40" cy="40" r="40" fill="#4BB543" />
                    <path
                        d="M24 42L36 54L56 34"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Success!</h2>
                <p className="mt-2 text-gray-600 text-center">
                    Your operation was completed successfully. Please wait for approval.
                </p>
            </div>
        </motion.div>
    )
}