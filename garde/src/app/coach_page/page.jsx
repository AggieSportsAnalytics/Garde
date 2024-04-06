import "../../app/globals.css"
import React from "react";

export default function CoachPage() {
    return (
        <div>
            <button class="cursor-pointer duration-200 hover:scale-125 active:scale-100" title="Go Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" className="stroke-blue-300">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M11 6L5 12M5 12L11 18M5 12H19"></path>
                </svg>
            </button>
            <aside></aside>
            <header></header>
            <section></section>
            <section>
                <h1>Analytics</h1>
            </section>
        </div>
    );
}