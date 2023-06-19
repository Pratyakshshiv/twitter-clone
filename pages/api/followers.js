import { initMongoose } from "../../lib/mongoose";
import Follower from "../../models/Follower";
import User from "../../models/User";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async function handle(req, res) {
  await initMongoose();
  const session = await getServerSession(req, res, authOptions);
  const { destination } = req.body;
  const existingFollow = await Follower.findOne({
    destination,
    source: session.user.id,
  });
  if (existingFollow) {
    await existingFollow.remove();
    res.json(null);
  } else {
    const temp = await Follower.create({
      destination,
      source: session.user.id,
    });
    res.json(temp);
  }
}
