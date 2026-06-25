import Image from "next/image"


type hourlyWeatherType = {
  icon: string | null,
  time: number | string,
  minTemperature: number | string

}

function HourlyWeatherCard({ icon, minTemperature, time }: hourlyWeatherType) {
  return (
    <div className="flex flex-row justify-between  items-center pl-3 pr-4 pb-2 pt-3 border-2  border-(--color-neutral-700) rounded-xl">
      <div className="flex justify-between items-center gap-4">
        {icon && <Image src={icon} alt="Time Forcast Icon" width={40} height={40} />}
        <div className="flex gap-2">
          <p>{time}</p>

        </div>
      </div>
      <div className="relative">{minTemperature} <div className="size-2 rounded-full border-2  absolute left-5 top-0"></div> </div>
    </div>
  )
}

export default HourlyWeatherCard
