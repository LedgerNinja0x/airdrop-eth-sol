export const getUserRating = (solBalance, ethBalance, tokenBalance, tokenValue, solGas, ethGas, followers) => {
    return Math.round(
        Number(solBalance) + Number(ethBalance) + Number(tokenValue) / Number(tokenBalance) + Number(solGas) + Number(ethGas) + Number(followers)
    )
}