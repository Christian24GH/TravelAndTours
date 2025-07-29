import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { useState } from "react";
import { routes } from "@/routes";
import { router, usePage } from "@inertiajs/react";


export function LoginForm({ className, ...props }) {
    const error = usePage();
    console.log(error)
    const [FormData, setFormData] = useState({});
    const [FormError, setFormError] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    const FormSubmit = (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setFormError({}); // reset previous errors

        if (!FormData.email || !FormData.password) {
            setFormError({
                Email: !FormData.email ? "The Email field is empty" : undefined,
                Password: !FormData.password
                    ? "The Password field is empty"
                    : undefined,
            });
            setIsSubmitting(false);
            return;
        } else {
            setFormError({});
        }


        //Ajax via router
        router.post(routes.login, FormData, {
            onError: (errors) => {
                console.log(errors)
                setFormError({
                    Unauthorized: errors.message,
                });
            },
            onFinish: ()=>{
                setIsSubmitting(false);
            }
        });
    };

    const InputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...FormData,
            [name]: value,
        });
    };

    return (
        <form
            onSubmit={FormSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                </p>
            </div>
            {FormError.Unauthorized && (
                <Alert className={"bg-red-100"}>
                    <AlertDescription className={"text-red-600 "}>
                        {FormError.Unauthorized}
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <div className="flex item-center">
                        <Label htmlFor="email">Email</Label>
                        {FormError.Email && (
                            <AlertDescription
                                className={"ml-auto text-sm text-red-600"}
                            >
                                {FormError.Email}
                            </AlertDescription>
                        )}
                    </div>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        value={FormData.email || ""}
                        onChange={InputChange}
                        className={FormError.Email && "border-red-600"}
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {
                            /*<a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                              Forgot your password?
                           </a>*/
                            FormError.Password && (
                                <AlertDescription className="ml-auto text-sm text-red-600">
                                    {FormError.Password}
                                </AlertDescription>
                            )
                        }
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={FormData.password || ""}
                        onChange={InputChange}
                        className={FormError.Password && "border-red-600"}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {" "}
                    Login
                </Button>
            </div>
        </form>
    );
}
