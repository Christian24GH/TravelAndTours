import React from 'react';
import { Link } from 'react-router';
export default function LandingPage() {
    return(
        <>
        <title>JOLI Travel and Tours</title>
        Landing
        Go to <Link to="/login" className="underline">Login</Link>
        </>
    )
}