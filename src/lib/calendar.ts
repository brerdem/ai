import ApiCalendar from "react-google-calendar-api";

const config = {
  clientId:
    "718969978098-l19trdis617tiouia8mmkn97tfg3uefj.apps.googleusercontent.com",
  apiKey: "AIzaSyCvx1lTwX-dv2AALG11IIu6dEeRiUXla5s",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

export const apiCalendar = new ApiCalendar(config);
