export const getUserRating = (ethBalance, tokenBalance, tokenValue, ethGas, followers) => {
    let sum = 0;
    try {
        sum += Number(ethBalance) + Number(ethGas) + Number(followers);
        if (Number(tokenBalance) != 0) {
            sum += Number(tokenValue) / Number(tokenBalance)
        }
        return Math.round(
            sum
        )
    } catch (err) {
        return 0;
        console.log(err);
    }
}