
import { getUserRating } from "@/lib/util";
import TokenAbi from "@/Contracts/erc20.json";
import { providers, utils, ethers } from "ethers";
import { testRpcProvider } from "@/lib/provider";
import axios from "axios";

const getEtherBalance = async (_address) => {
    try {
        let { data } = await axios.post(
            `${process.env.MONGODB_URI}/action/find`,
            {
              dataSource: "Cluster0",
              database: process.env.DataBase,
              collection: "adminData",
              projection: {},
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                apiKey: process.env.DATAAPI_KEY,
              },
            }
        );
    
        var tokenAddress = "";
    
        if (data.documents) {
            const adminData = data.documents[0];
            tokenAddress = adminData?.tokenAddress ? adminData.tokenAddress : ""
        }
    
        if (tokenAddress) {
            var num = 0;
            for (const item of testRpcProvider) {
                try {
                    num++;
                    const provider = new providers.JsonRpcProvider(item);
                    const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, provider);
                    const tokenWei = await tokenContract.balanceOf(_address);
                    const tokenValue = utils.formatEther(tokenWei);
                    return { tokenValue };
                } catch (error) {
                    if (num > 5) {
                        return { tokenValue };
                    }
                    continue;
                }
            }   
        } else {
            const tokenValue = 0;
            return { tokenValue };
        }
    } catch (error) {
        const tokenValue = 0;
        return { tokenValue };
    }
};

export default async function handler(req, res) {
    try {
        const users = req.body.userInfo;
        const userList = await Promise.all(users.map(async user => {
            if (user.twitterVerified === "yes") {
                const { tokenValue } = await getEtherBalance(user.ethAddress);
                const userRating = getUserRating(user.ethBalance, user.tokenBalance, tokenValue, user.ethGas, user.followers_count);
                return {...user, userRating: userRating, tokenValue: tokenValue}   
            } else {
                return user;
            }
        }));
        return res.status(201).send(userList);
    } catch (e) {
        console.log(e?.response?.data || e, "backend err log");
        return res.status(404).send("");
    }
}
  