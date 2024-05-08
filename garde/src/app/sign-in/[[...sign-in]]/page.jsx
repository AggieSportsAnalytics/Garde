import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import "../../../app/globals.css"

export default function Page() {
  return (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <SignIn />
      <h2 className="mt-2 text-white flex justify-center">Coaches please enter your access key below.</h2>
      <div className="flex justify-center mt-5">
        <input type="password" className="rounded-md"></input>
        <Link href="/coach_page">
          <input type="button" className="ml-5 text-white rounded-lg bg-slate-800 p-2" value="Submit" />
        </Link>
      </div>
  </div>
  );

}