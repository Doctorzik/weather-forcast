



type weatherDetails = {
  title: string,
  number: number,
  type : string
}

 export function WeatherDetailes({ title, number, type}: weatherDetails) {

  return (
    <div className="bg-(--color-neutral-800) p-2 space-y-6 lg:py-6 rounded-xl h-40 flex flex-col  items-center justify-between">
      <h3 className="text-preset-6">{title}</h3>
      <div className="text-preset-3  flex flex-row gap-2 justify-center items-center">
       
        <div>{number}</div>
        {type}
       
      </div>
    </div>
  )
}

type loading = {
  title : string
}

export function WeatherDetailsLoading({title}: loading){

return (
  <div className="bg-(--color-neutral-800) p-2 space-y-6 lg:py-6 rounded-xl h-40 flex flex-col  items-center justify-between">
    <h3 className="text-preset-6">{title}</h3>
    <div className="text-preset-3 relative flex flex-col justify-center items-center">  - </div>
  </div>
)
}