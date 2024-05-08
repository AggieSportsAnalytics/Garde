import { SignUp } from "@clerk/nextjs";
import "../../../app/globals.css"

export default function Page() {
  return (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <SignUp />
    <h2 className="text-white flex justify-center mt-5"> Coaches please use the contact form to get an access < br/> key to use Garde </h2>
  </div>
  );

}