import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, LogOut } from "lucide-react";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

export default function LandingPage() {
    const { auth, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen p-4">
            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                {/* Welcome Message */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome, {auth?.name || 'Guest'}!
                    </h2>
                </div>

                {/* Website Maintenance Notice */}
                <Card className="mb-8 border-amber-200 bg-amber-50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <CardTitle className="text-amber-800">Website Maintenance Notice</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-amber-700 text-base leading-relaxed">
                            <p className="mb-3">
                                <strong>Welcome to Travel & Tours!</strong> Our website is currently undergoing scheduled maintenance to improve your experience.
                            </p>
                            <p className="mb-3">
                                During this maintenance period, some features may be temporarily unavailable or have limited functionality. 
                                We apologize for any inconvenience this may cause.
                            </p>
                            <p>
                                We expect all services to be fully restored soon. Thank you for your patience, 
                                and please contact our support team if you need immediate assistance.
                            </p>
                        </CardDescription>
                    </CardContent>
                </Card>

                {/* Footer Information */}
                <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6">
                        <div className="text-center text-gray-600">
                            <p className="mb-2">
                                <strong>Need Help?</strong>
                            </p>
                            <p className="text-sm">
                                Contact our support team at{" "}
                                <span className="font-medium text-blue-600">support@travelandtours.com</span>
                                {" "}
                            </p>
                            <p className="text-xs mt-3 text-gray-500">
                                © 2025 Travel & Tours. All rights reserved.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
