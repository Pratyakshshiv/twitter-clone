import mongoose from "mongoose";
import { initMongoose } from "../../lib/mongoose";
import User from "../../models/User";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Follower from "../../models/Follower";

export default async function handle(req, res) {
  await initMongoose();

  const session = await getServerSession(req, res, authOptions);
  if (req.method === "PUT") {
    const { username } = req.body;
    await User.findByIdAndUpdate(session.user.id, { username });
    res.json("ok");
  }
  if (req.method === "GET") {
    const { id, username } = req.query;

    const user = id
      ? await User.findById(id)
      : await User.findOne({ username });
    const follow = await Follower.findOne({
      destination: user._id,
      source: session.user.id,
    });
    res.json({ user, follow });
  }
}
