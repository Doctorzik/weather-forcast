import Image from "next/image";
import { Button } from "../ui/button";
import errorImage from "@/public/images/icon-error.svg"
import { useRouter } from "next/navigation";

type errorMessageTyoe = {
  message: string | null
  setError: (error: boolean) => (void)
  error : boolean
}
export const WeatherErrorCard = ({ message, setError , error}: errorMessageTyoe) => {
  const router = useRouter()
  function init(){
    if(error){
      setError(!error)
    }else {
      setError(error)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto flex  ">
      <div className="rounded-2xl bg-neutral-800 p-8 text-center flex flex-col justify-center items-center">
        <Image
          src={errorImage}
          alt={""}
          width={20}
          height={200}>

        </Image>



        <h2 className="text-preset-3 mt-6">
          {message}
        </h2>

        <p className="text-preset-6 mt-3">
          We couldn&apos;t connect to the server (API error).
          Please try again in a few moments.
        </p>

        <Button
          onClick={() => 
            {router.refresh()
              init()
            }
    
          }   >
          Retry
        </Button>
      </div>
    </div>
  )
}
