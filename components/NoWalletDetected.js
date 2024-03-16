
const NoWalletDetected = () => {
    return (
        <div>
            <h2>No Ethereum wallet was detected. <br />
            Please install{" "}</h2>
            <a
              href="https://www.coinbase.com/wallet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coinbase Wallet
            </a>
            or{" "}
            <a href="http://metamask.io" target="_blank" rel="noopener noreferrer">
              MetaMask
            </a>
            .
        </div>
    )
}

export default NoWalletDetected;