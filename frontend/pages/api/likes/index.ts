import type { NextApiRequest, NextApiResponse } from "next";
import { getContract } from "../../../utils/contract";
import { utils } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { contract, account } = await getContract();
    const { postId, root, externalNullifier, nullifierHash, solidityProof } =
      JSON.parse(req.body);

    let options = { from: account, gas: 6721900 };
    console.log(postId);

    const tx = await contract.methods
      .likePost(
        utils.formatBytes32String(postId),
        utils.formatBytes32String("newLike"),
        root,
        nullifierHash,
        externalNullifier,
        solidityProof
      )
      .send(options);
    console.log(tx);
    let { returnValues } = tx.events.PostLiked;
    console.log(returnValues);
    // let numLikes = returnValues["likes"];
    // let pId = returnValues["postId"];

    // let identityCommitments: any = [];

    // for (var i = 0; i < identityCommitmentsBN.length; i++) {
    //   identityCommitments.push(identityCommitmentsBN[i].toString());
    // }
    res.status(200).end();
  } catch (error: any) {
    res.status(500).send(error.reason || "Failed to get");
  }
}
