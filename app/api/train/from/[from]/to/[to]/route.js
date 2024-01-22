import connectDB from "@/libs/connectDB";
import UserAgent from "user-agents";
import Scraper from "@/utils/Scraper";
import { saveTrainData, saveTrainSearchData } from "@/utils/saveTrain";
import { NextResponse } from "next/server";
import TrainSearch from "@/models/TrainSearch";

export async function GET(request, { params }) {
  const { from, to } = params;
  console.log({ from, to });
  await connectDB();
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
    let json = Scraper.getTrainsBetweenStations(data);

    //this will be removed after I have enough data in the database
    await Promise.all(
      json.data.map(async (trainObj) => await saveTrainData(trainObj))
    );

    const trainSearchData = await TrainSearch.findOne({ from, to });
    if (!trainSearchData)
      await saveTrainSearchData({ from, to, data: json.data });
    else json = trainSearchData;

    return NextResponse.json(json);
  } catch (error) {
    console.log(error);
  }
}
