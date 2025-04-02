import { Button } from "@/components/ui/button";
import Image from "next/image";
import {Avatar} from "@/components/ui/avatar";

const Hero = () => {
  return (
    <section className="py-20 md:py-28 flex justify-center bg-blue-50"> 
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-medium tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-indigo-"> 
                24/7 Mental Health Support at Your Fingertips
              </h1>
              <p className="max-w-[600px] text-black md:text-lg mt-4"> 
                Our AI-powered chatbot provides compassionate mental health support, resources, and guidance whenever you need it, while maintaining your privacy.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <a href="/signup" className="px-8 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white"> 
                Get Started
              </a>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar 
                      key={i} 
                      className="h-8 w-8 rounded-full border-2 border-white bg-slate-300"
                    />
                  ))}
                </div>
                <div className="ml-2">
                  <p className="text-black">Trusted by 10,000+ users</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <img
                src="https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fG1lbnRhbCUyMGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D"
                alt="AI Mental Health Support"
                className="object-contain rounded-lg shadow-md border-4 border-white" /* Added white border and subtle shadow */
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;