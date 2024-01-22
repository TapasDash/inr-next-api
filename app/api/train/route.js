import connectDB from "@/libs/connectDB";
import TrainTimetable from "@/models/TrainTimetable";
import Scraper from "@/utils/Scraper";
import { saveTrainData } from "@/utils/saveTrain";
import { NextResponse } from "next/server";

// export async function POST(request) {
//   const { title, description } = await request.json();
//   await connectDB();
//   await Topic.create({ title, description });
//   return NextResponse.json(
//     {
//       success: true,
//       message: "Topic has been created sucessfullly",
//     },
//     { status: 201 }
//   );
// }

export async function GET(request) {
  await connectDB();
  console.log({ request });
  const trainNo = request.nextUrl.searchParams.get("trainNo");
  console.log({ trainNo });
  // const { trainNo } = req.query;
  const URL_Train = `https://erail.in/rail/getTrains.aspx?TrainNo=${trainNo}&DataSource=0&Language=0&Cache=true`;
  try {
    const response = await fetch(URL_Train);
    const data = await response.text();

    let json = Scraper.getTrainInfo(data);
    const trainData = await TrainTimetable.findOne({ trainNo });
    if (!trainData) await saveTrainData(json);
    else json = trainData;
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message });
  }
}

export async function DELETE() {
  const id = request.nextUrl.searchParams.get("id"); //eqv to req.query.id
  await connectDB();
  await Topic.findByIdAndDelete(id);
  return NextResponse.json({
    success: true,
    message: "Topic has been deleted successfully",
  });
}
