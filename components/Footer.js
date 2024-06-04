import Link from "next/link";

const Footer = () =>{
    return (
        <div className="w-screen text-center text-2xl my-10 font-bold">
            <Link href="https://forwardprotocol.io/">Powered by <span className="text-green-400">Forward Protocol</span></Link>
        </div>
    );
}

export default Footer;