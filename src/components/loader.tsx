import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600 text-lg">Loading, please wait...</p>
      </div>
    </div>
  );
}
