import connectDB from "@/libs/connectDB";
import UserAgent from "user-agents";
import Scraper from "@/utils/Scraper";
import { saveTrainData, saveTrainSearchData } from "@/utils/saveTrain";
import { NextResponse } from "next/server";
import TrainSearch from "@/models/TrainSearch";

const getDayOnDate = (DD, MM, YYYY) => {
  let date = new Date(YYYY, MM, DD);
  let day =
    date.getDay() >= 0 && date.getDay() <= 2
      ? date.getDay() + 4
      : date.getDay() - 3;
  return day;
};

export async function GET(request, { params }) {
  const arr = [];
  const returnResponse = {};
  const { from, to, date } = params;
  await connectDB();
  if (!date) {
    returnResponse["success"] = false;
    returnResponse["timestamp"] = Date.now();
    returnResponse["data"] = "Please Add Specific Date";
    res.json(returnResponse);
    return;
  }
  const URL_Trains = `https://erail.in/rail/getTrains.aspx?Station_From=${from}
  &Station_To=${to}
  &DataSource=0&Language=0&Cache=true`;
  try {
    const userAgent = new UserAgent();
    const response = await fetch(URL_Trains, {
      method: "GET",
      headers: { "User-Agent": userAgent.toString() },
    });
    const data = await response.text();
    const json = Scraper.getTrainsBetweenStations(data);
    if (!json["success"]) return NextResponse.json(json);
    const DD = date.split("-")[0];
    const MM = date.split("-")[1];
    const YYYY = date.split("-")[2];
    const day = getDayOnDate(DD, MM, YYYY);
    json["data"].forEach((ele, ind) => {
      if (ele["runningDays"][day] == 1) arr.push(ele);
    });
    returnResponse["success"] = true;
    returnResponse["timestamp"] = Date.now();
    returnResponse["data"] = arr;
    return NextResponse.json(returnResponse);
  } catch (err) {
    console.log(err);
  }
}
