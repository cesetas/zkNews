import type { NextApiRequest, NextApiResponse } from "next";
import { getContract } from "../../../utils/contract";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { zkNewsContract, account } = await getContract();

    let options = { from: account, gas: 6721900 };
    let identityCommitments: any = [];
    const identityCommitmentsBN = await zkNewsContract.methods
      .getIdentityCommitments()
      .call(options);

    // for (var i = 0; i < identityCommitmentsBN.length; i++) {
    //   identityCommitments.push(identityCommitmentsBN[i].toString());
    // }
    // console.log(identityCommitmentsBN);
    // console.log(zkNewsContract);

    res.status(200).send(identityCommitmentsBN);
  } catch (error: any) {
    res.status(500).send(error.reason || "Failed to get");
  }
}
