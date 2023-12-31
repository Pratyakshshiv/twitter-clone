import mongoose from "mongoose";
import { initMongoose } from "../../lib/mongoose";
import Post from "../../models/Post";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Like from "../../models/Like";
import Follower from "../../models/Follower";

export default async function handle(req, res) {
  await initMongoose();
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "POST") {
    const { text, parent, images } = req.body;
    const newPost = await Post.create({
      author: session?.user?.id,
      text,
      parent,
      images,
    });
    if (parent) {
      const parentPost = await Post.findById(parent);
      parentPost.commentsCount = await Post.countDocuments({ parent });
      await parentPost.save();
    }
    res.json(newPost);
  }
  if (req.method === "GET") {
    const { id } = req.query;
    if (id) {
      const post = await Post.findById(id).populate("author").populate({
        path: "parent",
        populate: "author",
      });
      res.json({ post });
    } else {
      const parent = req.query.parent || null;
      const author = req.query.author;
      let searchFilter;
      if (!author && !parent) {
        const myFollows = await Follower.find({
          source: session?.user?.id,
        }).exec();
        const idIFollow = myFollows.map((f) => f.destination);
        searchFilter = { author: [...idIFollow, session?.user?.id] };
        if (idIFollow.length === 0) {
          searchFilter = {};
        }
      }
      if (author) {
        searchFilter = { author };
      }
      if (parent) {
        searchFilter = { parent };
      }
      const posts = await Post.find(searchFilter)
        .populate("author")
        .populate({
          path: "parent",
          populate: "author",
        })
        .limit(20)
        .sort({ createdAt: -1 })
        .exec();
      const postsLikedByMe = await Like.find({
        author: session?.user?.id,
        post: posts.map((p) => p._id),
      });
      const idsLikedByMe = postsLikedByMe.map((like) => like.post);
      res.json({
        posts,
        idsLikedByMe,
      });
    }
  }
}
