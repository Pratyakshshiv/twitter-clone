import mongoose from "mongoose";
import { initMongoose } from "../../lib/mongoose";
import User from "../../models/User";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import multiParty from "multiparty";
import S3 from "aws-sdk/clients/s3";
import fs from "fs";

export default async function handle(req, res) {
  await initMongoose();
  const session = await getServerSession(req, res, authOptions);

  const s3Client = new S3({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const form = new multiParty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      throw err;
    }
    // if (!files || !files["cover"]) {
    //   res.json(files);
    //   return;
    // }
    const type = Object.keys(files)[0];
    const fileInfo = files[type][0];
    const filename = fileInfo?.path?.split("/").slice(-1)[0];
    s3Client.upload(
      {
        Bucket: "agyaat-twitter-clone",
        Body: fs.readFileSync(fileInfo.path),
        ACL: "public-read",
        Key: filename,
        ContentType: fileInfo.headers["content-type"],
      },
      async (err, data) => {
        if (type === "cover" || type === "image") {
          const user = await User.findByIdAndUpdate(session.user.id, {
            [type]: data.Location,
          });
        }
        fs.unlinkSync(fileInfo.path);
        // if (data.Location) {
        //   let imgLink;
        //   if (type === "image") {
        //     imgLink = user?.image;
        //   } else {
        //     imgLink = user?.cover;
        //   }
        //   if (!imgLink) return;
        //   s3Client.deleteObject(
        //     {
        //       Bucket: "agyaat-twitter-clone",
        //       Key: imgLink,
        //     },
        //     async (err, data) => {
        //       if (err) console.log(err);
        //       else {
        //         console.log("Link Deleted");
        //         console.log(data);
        //       }
        //     }
        //   );
        // }
        res.json({ err, data, fileInfo, src: data.Location });
      }
    );
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
