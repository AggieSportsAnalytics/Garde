import { SignUp } from "@clerk/nextjs";
import "../../../app/globals.css"

export default function Page() {
  return (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <button class="translate-x-50 cursor-pointer duration-200 hover:scale-125 active:scale-100" title="Go Back">
      <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" class="stroke-blue-300">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M11 6L5 12M5 12L11 18M5 12H19"></path>
      </svg>
    </button>
    <h2 className="text-white flex justify-center"> Coaches Please Sign Up Here</h2>
    <SignUp />
  </div>
  );

}