import { clsx, type ClassValue } from "clsx";
import { readRouteCacheEntry } from "next/dist/client/components/segment-cache/cache";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getWeatherImage = (code: number) => {
	if ([0, 1].includes(code)) {
		return "/images/icon-sunny.webp";
	}

	if (code === 2) {
		return "/images/icon-partly-cloudy.webp";
	}
	if (code === 3) {
		return "/images/icon-overcast.webp";
	}
	if ([45, 48].includes(code)) {
		return "/images/icon-fog.webp";
	}
	if ([51, 53, 55, 56, 57].includes(code)) {
		return "/images/icon-drizzle.webp";
	}
	if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
		return "/images/icon-rain.webp";
	}
	if ([71, 73, 75, 77, 85, 86].includes(code)) {
		return "/images/icon-snow.webp";
	}
	if ([95, 96, 99].includes(code)) {
		return "/images/icon-storm.webp";
	}

	return "/images/icon-sunny.webp";
};

export const getDay = (date: string) => {
	const dayOfWeek = new Date(date).getUTCDay();
	let day;
	switch (dayOfWeek) {
		case 0: {
			day = "Sunday";
			break;
		}
		case 1: {
			day = "Monday";
			break;
		}
		case 2: {
			day = "Tuesday";
			break;
		}
		case 3: {
			day = "Wednesday";
			break;
		}
		case 4: {
			day = "Thursday";
			break;
		}
		case 5: {
			day = "Friday";
			break;
		}
		case 6: {
			day = "Saturday";
			break;
		}
		default: {
			day = "";
		}
	}

	return day;
};

export const shortenDay = (day: string) => {
	return day.slice(0, 3);
};
export function formatTime(dateTimeString: string) {
	return new Date(dateTimeString).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export const fetchDataLocations = async (query: string) => {
	
	try {

		const response = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${query}`,
		);
		if (response.ok) {
			const results = await response.json();
       
			  return {
				data: results?.results,
				error: false,
				message: "Data successfully fetched",
			};
		}
	} catch (error: unknown) {

	 return  {
		message: `An error occured${error}` ,
		error: true,

	 }
	}

}

export function handleApiError(error: unknown){

	if(!navigator.onLine){
		return "No internet connection";
	}
	if(error  instanceof Error 
	){
		return error.message
	}
	return "Unexpected error occured"
}