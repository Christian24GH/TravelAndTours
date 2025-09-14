import { Pressable, Text } from "react-native";
import clsx from "clsx";

type ButtonProps = {
  label: string;
  variant?: "default" | "outline" | "destructive";
  onPress: () => void;
  className?: string;
  textClassName?: string;
};

export function Button({ label, variant = "default", onPress, className, textClassName, }: ButtonProps) {
  const base = "px-4 py-2 rounded-md shadow items-center justify-center";
  const variants = {
    default: "bg-indigo-600",
    outline: "border border-gray-300 bg-white",
    destructive: "bg-red-600",
  };

  const textVariants = {
    default: "text-white font-medium w-full text-center",
    outline: "text-gray-700 font-medium w-full text-center",
    destructive: "text-white font-medium w-full text-center",
  };

  return (
    <Pressable onPress={onPress} className={clsx(base, variants[variant], className)}>
      <Text className={clsx(textVariants[variant], textClassName)}>{label}</Text>
    </Pressable>
  );
}
