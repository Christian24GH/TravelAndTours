import { cn } from "@/lib/utils"

export default function CardImage({ 
    className,
    ...props
    }) {
      return (
        <div
          className={cn(
            "w-90 h-60 border-black border-1 rounded-md overflow-hidden relative",
            className
          )}
          {...props} >
          
          <img src={props.src}/>
          <div className="absolute bottom-0 left-0 p-4">
            <p className="font-bold text-white">{props.name}</p>
            <p className="text-white">{props.desc}</p>
          </div>
        </div>
      );
}