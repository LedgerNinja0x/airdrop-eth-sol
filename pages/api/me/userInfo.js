
import { getUserRating } from "@/lib/util";
import TokenAbi from "@/Contracts/erc20.json";
import { providers, utils, ethers } from "ethers";
import { testRpcProvider } from "@/lib/provider";
import axios from "axios";

const getEtherBalance = async (_address, tokenAddress) => {
    try {
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
            tokenAddress = adminData?.tokenAddress ? adminData.tokenAddress : "";
        }

        const users = req.body.userInfo;
        const userList = await Promise.all(users.map(async user => {
            if (user.ethAddress) {
                if (tokenAddress) {
                    var { tokenValue } = await getEtherBalance(user.ethAddress, tokenAddress);
                }
                const userRating = getUserRating(Number(user.ethBalance), Number(user.solBalance), Number(user.followers_count));
                return {...user, userRating: userRating, tokenValue: tokenValue, token_airdrop: user?.tokenBalance && user.tokenBalance.length > 0 ? user.tokenBalance.filter(key => key.contract == tokenAddress)[0].balance : 0}
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
  