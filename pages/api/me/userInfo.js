
import { getUserRating } from "@/lib/util";
import TokenAbi from "@/Contracts/erc20.json";
import contractAddress from "@/Contracts/addresses.json";
import { providers, utils, ethers } from "ethers";
import { testRpcProvider } from "@/lib/provider";


const getEtherBalance = async (_address) => {
    for (const item of testRpcProvider) {
        try {
            const provider = new providers.JsonRpcProvider(item);
            const wei = await provider.getBalance(_address);
            const ethBalance = utils.formatEther(wei);
            const tokenContract = new ethers.Contract(contractAddress.Token, TokenAbi, provider);
            const tokenWei = await tokenContract.balanceOf(_address);
            const tokenValue = utils.formatEther(tokenWei);
            return { ethBalance, tokenValue };
        } catch (error) {
            console.log(error);
        }
    }
};

export default async function handler(req, res) {
    try {
        const users = req.body.userInfo;
        const userList = await Promise.all(users.map(async user => {
            if (user.twitterVerified === "yes") {
                const { ethBalance, tokenValue } = await getEtherBalance(user.ethAddress);
                const userRating = getUserRating(user.solBalance, ethBalance, user.tokenBalance, tokenValue, user.solGas, user.ethGas, user.followers_count);
                return {...user, userRating: userRating, ethBalance: ethBalance, tokenValue: tokenValue}   
            } else {
                return user;
            }
        }));
        return res.status(201).send(userList);
    } catch (e) {
        console.log(e?.response?.data || e, "backend err log");
    }
}
  