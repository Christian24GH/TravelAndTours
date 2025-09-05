import React from 'react';
import { Link } from 'react-router';
export default function LandingPage() {
    return(
        <>
        Landing
        Go to <Link to="/login" className="underline">Login</Link>
        </>
    )
}