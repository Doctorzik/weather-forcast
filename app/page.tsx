"use client"

import logo from '@/public/images/logo.svg'
import IconUnit from '@/public/images/icon-units.svg'
import IconDropDwown from '@/public/images/icon-dropdown.svg'
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import dropdpwIcon from "@/public/images/icon-dropdown.svg"
import searchImage from "@/public/images/icon-search.svg"
import { useEffect,  useState } from "react"
import Image from "next/image";

import { WeatherDetailsLoading, WeatherDetailes } from "@/components/molecules/WeatherDetailes";
import ForecastContainer from "@/components/molecules/ForecastContainer";
import HourlyWeatherCard from "@/components/molecules/HourlyWeatherCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner"

import clsx from "clsx"

import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchDataLocations, formatTime, getDay, getWeatherImage, handleApiError, shortenDay } from '@/lib/utils'
import { WeatherErrorCard } from '@/components/molecules/WeatherErrorCard'


type locationType =
  {
    name: string,
    latitude: number,
    longitude: number,
    id: number,
    country: string,
    timezone: string
  }

type WeatherCurrent = {
  time: string;
  is_day: number;
  weather_code: number;
  precipitation: number;
  temperature_2m: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
};

type WeatherCurrentUnits = {
  precipitation: string;
  temperature_2m: string;
  wind_speed_10m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
};

type WeatherDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type WeatherHourly = {
  time: string[];
  weather_code: number[];
  temperature_2m: number[];
  is_day: number[];
};

type WeatherReport = {
  countryName: string;
  searchName: string;
  current: WeatherCurrent;
  current_unit: WeatherCurrentUnits;
  daily: WeatherDaily;
  hourly: WeatherHourly;
};

type HourlyReport = {
  time: string;
  weather_code: number;
  temperature_2m: number;
  is_day: number;
};



export type Params = {
  latitude: number | null;
  longitude: number | null;
  current: string[]
  unit: string;
  daily: string[];
  timezone: string;
  hourly: string[];
  temperature: string;
  precipitation: string;
  windspeed: string;
};
export default function Home() {
  const [searchLoading, setSearchLoading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const [day, setDay] = useState("Tuesday")
  const [query, setQuery] = useState("")
  const [hourlDailyReport, setHourlyDailyReport] = useState<HourlyReport[]>([])
  const [data, setData] = useState<locationType[] | null>(null)
  const [report, setReport] = useState<WeatherReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrormessage] = useState<null | string>(null)
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<locationType | null>(null)



  const [params, setParams] = useState<Params>({
    latitude: null,
    longitude: null,
    current: ["is_day", "weather_code", "precipitation", "temperature_2m", "wind_speed_10m", "relative_humidity_2m", "apparent_temperature"],
    unit: "",
    daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
    timezone: "auto",
    hourly: ["weather_code", "temperature_2m", "is_day"],
    temperature: "celsius",
    precipitation: "mm",
    windspeed: "kmh",
  })
  const getDailyHoulyReport = () => {
    const dailyReportHourly: HourlyReport[] = []
    if (!report) return

    for (let i = 0; i < report.hourly.time.length; i++) {

      if (getDay(report.hourly.time[i]) === day) {
        dailyReportHourly.push(
          {
            time: report.hourly.time[i],
            weather_code: report.hourly.weather_code[i],
            temperature_2m: report.hourly.temperature_2m[i],
            is_day: report.hourly.is_day[i]
          }
        )

      }

    }

    setHourlyDailyReport(dailyReportHourly.filter((hourly) => hourly.is_day === report.current.is_day))





  }


  
  // This function gets the latitude and longitude for first load.
  // The user accept or reject using its location on first loading of website to 
  // get weather reports.
  useEffect(() => {
    if (!navigator.geolocation) return


    navigator.geolocation.getCurrentPosition(
      (position) => {
        setWeatherLoading(true)
        setParams(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
      },


    )
  }, [])


  useEffect(
    () => {
      const locationDate = async () => {
        setSearchLoading(true)

        try {
          if (query.length < 2) {
            setData([])
            setSearchError(false)
            return
          }
          setSearchLoading(true)
          const response = await fetchDataLocations(query.trim())

          if (response?.error) {
            setError(true)
           
    
          }

          else {
            if (response?.data === undefined) {
              setData([])
              setSearchError(true)
            }
            else {
              setSearchError(false)
              setOpen(true)
              setData(response.data)
            }

          }
        } catch (error) {
          setError(true)
      const message =      handleApiError(error)
           setErrormessage(message)
        
        }
        finally {
          setSearchLoading(false)
        }
      }

      locationDate()
      return () => setData([])
    }


    , [query]);



  useEffect(() => {
    
    
    const fetchData = async () => {
      try {

        if (
          params.latitude === null ||
          params.longitude === null
        ) {

          return;
        }


        setWeatherLoading(true)
        const querySearch = new URLSearchParams({
          latitude: String(params.latitude),
          longitude: String(params.longitude),
          current: params.current.join(","),
          unit: params.unit,
          daily: params.daily.join(","),
          timezone: params.timezone,
          hourly: params.hourly.join(","),
          temperature_unit: params.temperature,
          precipitation_unit: params.precipitation,
          windspeed_unit: params.windspeed,

        }).toString()
        const [weatherResponse, countryInfoResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?${querySearch}`),
          fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${params.latitude}&lon=${params.longitude}&appid=${process.env.NEXT_PUBLIC_API}`)
        ])
        const [weatherInfo, countryInfo] = await Promise.all([
          weatherResponse.json(), countryInfoResponse.json()])

        



        const countryNameResponse = await fetch(`https://api.restcountries.com/countries/v5/codes.alpha_2/${countryInfo[0].country}`,
          { headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COUNTRIES_API}` } }
        )
        const countryName = await countryNameResponse.json()



        setReport({
          countryName: countryName.data["objects"][0].names.common,
          searchName: countryInfo[0].name,
          current: weatherInfo.current,
          current_unit: weatherInfo.current_units,
          daily: weatherInfo.daily,
          hourly: weatherInfo.hourly
        })

      
        setLoading(false)
        setWeatherLoading(false)



      } catch (err) {
        const message = handleApiError(err)
         setErrormessage(message)
        setWeatherLoading(false)
        setError(true);
        setOpen(false);
      }
      finally {
        setWeatherLoading(false)
      }
    };
    fetchData()

    return () => setReport(null)

  }, [params])





  useEffect(() => {
    getDailyHoulyReport()
  }, [report, day])
  
  return (
    <div className="min-h-screen space-y-10 px-4 pt-4 pb-12 md:px-8  md:pb-20 m-auto  lg:px-28 lg:pt-12">


      <header className='flex justify-between items-center'>

        <Image src={logo} alt="Weather Forcaste  Logo"></Image>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Image src={IconUnit} alt="unit Icon"></Image>
              Units
              <Image src={IconDropDwown} alt="Icon Drop down"></Image>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-transparent text-white'>
            <DropdownMenuLabel>Temperature</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={params.temperature} onValueChange={(value) => setParams((prev) => ({
              ...prev,
              temperature: value
            }))}>
              <DropdownMenuRadioItem value="celsius">Celsius (C)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fahrenheit">Fahrenheit (F)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuLabel>Wind Speed</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={params.windspeed} onValueChange={(value) => setParams((prev) => ({
              ...prev,
              windspeed: value
            }))}>
              <DropdownMenuRadioItem value="kmh">km/h</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="mph">mph</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuLabel>Precipitation</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={params.precipitation} onValueChange={(value) => setParams((prev) => ({
              ...prev,
              precipitation: value
            }))
            }>
              <DropdownMenuRadioItem value="mm">Millimetres</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inch">Inches</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header >
      <h1 className="text-preset-2 text-center px-3 md:px-30  lg:px-10">How&apos;s the sky looking today?</h1>
      <Field className="flex  md:flex-row  text-center max-w-164 mx-auto relative">
        <div className="flex  justify-center items-center rounded-sm text-center   focus:ring-2 focus:outline-2  space-x-2  w-10 bg-(--color-neutral-800) relative ">
          <Image src={searchImage} alt="Search Icon" className="mx-2"></Image>
          <Input value={query} onChange={(e) => {
            
              setSearchLoading(true)
            
            
           
            setQuery(e.target.value)
          }} type="search" placeholder="Search for a place" className="border-none focus-visible:ring-0 focus:outline:none w-full " />
        </div>

        {open && data?.length !== 0 &&
          <div className={clsx(' relative  md:absolute  rounded-sm z-10 md:top-[50]  max-w-122 text-left bg-(--color-neutral-800) p-3 flex  flex-col gap-2', {
            'hidden': !open

          })}>

            {searchLoading && <div className="flex p-4 flex-row justify-even">
              <Spinner />
              <div className="text-(--text-preset-7)  ">Search in progress</div>
            </div>}
            {!searchLoading && data?.length !== 0 &&


              (
                data?.map((item, index) => {
                  return (
                    <div role="button" className='hover:cursor-grab' itemType='button' tabIndex={index + 1} data-value={item.id} onClick={() => {


                      setQuery(item.name)
                      setOpen(false)
                      setData([])
                      setSearchError(false)
                      // setParams(prev => ({
                      //   ...prev,
                      //   latitude: item.latitude,
                      //   longitude: item.longitude
                      // }))
                      setSelectedLocation(item)


                      setSearchLoading(false)
                    }} key={item?.id}>{item.name}</div>
                  )
                }))}

          </div>
        }


        <Button disabled={query.length < 1 || !selectedLocation} className={clsx("bg-(--blue-700) p-5 w-full md:w-40 hover:cursor-grab",
          {
            searchLoading: "disabled",
          }

        )} onClick={() => {

          if (!selectedLocation) return
        
          setQuery("")
          setOpen(false)

          setData([])
          setSearchError(false)
          setReport(null)
          setParams((prev) => ({
            ...prev,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude

          }))
          setSelectedLocation(null)
        }}>Search</Button>
      </Field>

      {searchError && <div className=" max-w-122 rounded-sm p-4 m-auto text-preset-4  text-center ">No search result found!</div>}


      {weatherLoading &&
        (
          <div className='space-y-8'>
            <div className='content-container grid grid-cols-1 lg:grid-cols-3 space-y-7 justify-center lg:gap-8  '>
              <div className=' col-span-2 ' >
                <div className='content-div space-y-7'>
                  <div className='bg-neutral-600 w-200 h-71.5 flex justify-center items-center'>
                    <div className='space-y-8'>
                      <div className='relative'>
                        <div className='bg-white rounded-full size-2 absolute top-3 left-0 '></div>
                        <div className='bg-white rounded-full size-2 absolute top-0 left-[50%]'></div>
                        <div className='bg-white rounded-full size-2 absolute top-3 right-0'></div>
                      </div>

                      <p>loading...</p>
                    </div>
                  </div>
                  <div className='bg-neutral-600 grid grid-cols-2 md:grid-cols-4 md:grid-rows-1  lg:grid-rows-1 grid-rows-2   gap-4'>
                    <WeatherDetailsLoading title='Feels Like' />
                    <WeatherDetailsLoading title='Humidity' />
                    <WeatherDetailsLoading title='Wind' />
                    <WeatherDetailsLoading title='Precipitation' />
                  </div>

                </div>
                <div className=''>
                  <h2 className="text-preset-5 my-5">Daily Forcast</h2>
                  <div className="daily-forcast grid gap-4 grid-cols-3 md:grid-cols-7 text-center items-center">
                    {Array.from({ length: 7 }, (_, index) => (
                      <div
                        key={index}
                        className="w-full h-41.25 bg-neutral-800 rounded"
                      />
                    ))}
                  </div>

                </div>
              </div>

              <div className='hourly-container    bg-neutral-800 rounded-2xl  px-4 py-5 space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2> Hourly Forcast</h2>
                  <div className='flex justify-between items-center gap-2  px-2 rounded-sm bg-neutral-400'> <span className='text-2xl'>-</span><Image src={dropdpwIcon} alt='dropdownIcon' /> </div>
                </div>
                <div className='flex flex-col gap-4'>
                  {Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      className="w-full h-15   border-2  border-neutral-700 rounded-xl"
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        )

      }

      {error ?
        <WeatherErrorCard error={error}  setError={setError} message={errorMessage}  />
        :
        report && (

          <div className="forcast-container space-y-8">
            <div className="content-container grid grid-cols-1 lg:grid-cols-3 space-y-7 justify-center lg:gap-8  relative">

              <div className="image-container space-y-12 col-span-2 ">
                <div className="space-y-7">
                  <div className="image bg-[url('/images/bg-today-small.svg')] md:bg-[url('/images/bg-today-large.svg')] bg-cover  bg-center flex flex-col md:flex-row md:justify-between justify-center items-center space-y-5 px-6 py-20 rounded-2xl">
                    <div className="location-info space-y-3">
                      <h2 className="text-preset-4">{report?.searchName} {report?.countryName}</h2>
                      <p className="text-preset-6">{new Date(report?.current?.time).toLocaleDateString("en-US", {

                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",

                      })}</p>
                    </div>
                    <div className="flex  justify-between items-center p-0 space-x-5">
                      <Image src={getWeatherImage(report.current?.weather_code)} alt="Sunny day" width="120" height={120} />
                      <div className="text-preset-1 w-37.5  h-24 relative text-center">

                        {Math.round(report?.current?.apparent_temperature)}<div className="size-4 rounded-full border-5 absolute top-0 -right-5"></div>
                      </div>
                    </div>
                  </div>



                  <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-1  lg:grid-rows-1 grid-rows-2   gap-4">


                    <WeatherDetailes type={report.current_unit.apparent_temperature} title='Feels Like' number={Math.round(report?.current?.temperature_2m)} />
                    <WeatherDetailes type={report.current_unit.relative_humidity_2m} title='Humidity' number={Math.round(report?.current?.relative_humidity_2m)} />
                    <WeatherDetailes type={report.current_unit.wind_speed_10m} title='Wind' number={Math.round(report?.current?.wind_speed_10m)} />
                    <WeatherDetailes type={report.current_unit.precipitation} title='Precipitation' number={Math.round(report?.current?.precipitation)} />
                  </div>
                </div>
                <div>
                  <h2 className="text-preset-5 my-5">Daily Forcast</h2>

                  <div className="daily-forcast grid gap-4 grid-cols-3 md:grid-cols-7 text-center items-center">
                    

                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[0]))} icon={getWeatherImage(report?.daily?.weather_code[0])} max={Math.round(report?.daily?.temperature_2m_max[0])} min={Math.round(report?.daily?.temperature_2m_min[0])} ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[1]))} icon={getWeatherImage(report?.daily?.weather_code[1])} max={Math.round(report?.daily?.temperature_2m_max[1])} min={Math.round(report?.daily?.temperature_2m_min[1])}  ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[2]))} icon={getWeatherImage(report?.daily?.weather_code[2])} max={Math.round(report?.daily?.temperature_2m_max[2])} min={Math.round(report?.daily?.temperature_2m_min[2])}  ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[3]))} icon={getWeatherImage(report?.daily?.weather_code[3])} max={Math.round(report?.daily?.temperature_2m_max[3])} min={Math.round(report?.daily?.temperature_2m_min[3])}  ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[4]))} icon={getWeatherImage(report?.daily?.weather_code[4])} max={Math.round(report?.daily?.temperature_2m_max[4])} min={Math.round(report?.daily?.temperature_2m_min[4])}  ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[5]))} icon={getWeatherImage(report?.daily?.weather_code[5])} max={Math.round(report?.daily?.temperature_2m_max[5])} min={Math.round(report?.daily?.temperature_2m_min[5])}  ></ForecastContainer>
                    <ForecastContainer day={shortenDay(getDay(report?.daily?.time[6]))} icon={getWeatherImage(report?.daily?.weather_code[6])} max={Math.round(report?.daily?.temperature_2m_max[6])} min={Math.round(report?.daily?.temperature_2m_min[6])} ></ForecastContainer>
                  </div>

                </div>

              </div>

              <div className="hourly-forcast-container   overflow-auto  bg-(--color-neutral-800) rounded-2xl  px-4 py-5 space-y-4 ">

                <div className="flex justify-between  ">

                  <h2>Hourly Forcast</h2>
                  <Select value={day} onValueChange={(e) => {
                    setDay(e)
                    getDailyHoulyReport()
                  }

                  } >
                    <SelectTrigger>
                      <SelectValue aria-label={day}>{day}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-(--color-neutral-800) text-(----color-neutral-100)  " >
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>



                </div>
                <div className='h-full py-3 lg:max-h-[300px] '>


                  {hourlDailyReport.map((reportHourly, index) => {
                    return (
                      <HourlyWeatherCard key={index} icon={getWeatherImage(reportHourly.weather_code)} time={formatTime(reportHourly.time)} minTemperature={Math.floor(reportHourly.temperature_2m)} />
                    )
                  })}



                </div>

              </div>






            </div>


          </div>



        )
      }






    </div>

  )
}
