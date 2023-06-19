import mongoose from "mongoose";
import { initMongoose } from "../../lib/mongoose";
import Like from "../../models/Like";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Post from "../../models/Post";

const updateLikeCount = async (postId) => {
  const post = await Post.findById(postId);
  post.likesCount = await Like.countDocuments({ post: postId });
  await post.save();
};

export default async function handle(req, res) {
  await initMongoose();
  const session = await getServerSession(req, res, authOptions);

  //   if (req.method === "POST")
  const postId = req.body.id;
  const userId = session.user.id;
  const existingLike = await Like.findOne({ author: userId, post: postId });
  if (existingLike) {
    await existingLike.remove();
    await updateLikeCount(postId);
    res.json(null);
  } else {
    const like = await Like.create({ author: userId, post: postId });
    await updateLikeCount(postId);
    res.json({ like });
  }
}
