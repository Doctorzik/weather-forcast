import { Loader2Icon, LoaderPinwheel } from 'lucide-react'
import React from 'react'

function WeatherInfoSkeleton() {
  return (
    <div className=' space-y-12 col-span-2  h-71.5 bg-[#262540]  justify-center flex items-center'>
      <div className='w-[79px] h-[52px]  '>
        <Loader2Icon />
        <p>Loading...</p>
      </div>
    </div>
  )
}

export default WeatherInfoSkeleton
