import { initMongoose } from "../../lib/mongoose";
import User from "../../models/User";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async function handle(req, res) {
  await initMongoose();

  const session = await getServerSession(req, res, authOptions);
  const { bio, name, username } = req.body;
  await User.findByIdAndUpdate(session.user.id, { bio, name, username });
  res.json("ok");
}
