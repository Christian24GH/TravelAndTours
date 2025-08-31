import { Button } from '@/components/ui/button';

export default function Landing() {
    return (
        <div className='min-h-screen grid grid-rows-4 items-center justify-center gap-5'>
            <div className="flex justify-center items-end h-full row-span-2">
                <h1 className='text-4xl font-bold text-red-500 hover:text-red-500/70 cursor-default drop-shadow-md'>Welcome to the Landing Page</h1>
            </div>
            <div className="flex justify-center items-start h-full">
               <Button className="hover:bg-red-600/20 font-bold border bg-transparent border-red-700 focus:text-red-500 text-red-500 rounded-sm px-4 py-1" onClick={() => window.location.href = '/login'}>Login</Button>
            </div>
        </div>
    );
}