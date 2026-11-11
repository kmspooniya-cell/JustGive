"use client";
import {useEffect} from "react";
export default function LocaleError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{console.error("Localized page error",error.digest);},[error]);return <main className="page-main" role="alert"><h1>Something went wrong</h1><p>We couldn’t load this page. Please try again.</p><button className="button" onClick={reset}>Try again</button></main>;}
