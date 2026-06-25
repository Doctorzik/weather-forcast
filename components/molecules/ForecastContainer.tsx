import Image from "next/image"

type dailyForcast = {
  day: string,
  icon: string,
  min: number,
  max: number
}

function ForecastContainer({ day, icon, min, max }: dailyForcast) {
  return (
    <div className="flex flex-col space-y-4 px-3 py-4 bg-(--color-neutral-700) rounded-2xl justify-center ">
      <h3 className="text-preset-6 ">{day}</h3>
      <Image alt="Weather Icon" src={icon} width={60} height={60} />
      <div className="flex flex-row justify-between items-center text-preset-7">
        <div className="relative">{max} <div className="size-2 rounded-full border-2  absolute top-0 left-5"></div> </div>
        <div className="relative">{min} <div className="size-2 rounded-full border-2  absolute  top-0 left-5"></div> </div>
      </div>
    </div>
  )
}

export default ForecastContainer
