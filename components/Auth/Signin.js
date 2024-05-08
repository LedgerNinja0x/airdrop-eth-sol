"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

const Signin = ({ providers, error }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  function handleSubmit(e) {
    setLoading(true);
    try {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      signIn("credentials", {
        callbackUrl: "/dashboard",
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      setLoading(false);
      alert("Something went wrong. Please try again later");
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 items-center">
        <div className="border-2 border-black rounded-3xl px-[32px] py-[24px] w-fit bg-[#FCF8EC]">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-4 text-center text-[48px] font-bold leading-9 tracking-tight text-gray-900">
              Admin Login
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm lg:w-[470px]">
            {/* <div className="mb-10 flex items-center justify-center">
              <span className="bg-gray-400 opacity-40 h-[1px] w-full sm:block"></span>
              <p className="px-2 text-center text-sm text-gray-500">or</p>
              <span className="bg-gray-400 opacity-40 h-[1px] w-full sm:block"></span>
            </div> */}
            {error && (
            <div className="bg-red-100 py-4 mb-8 my-2 w-full border-red-300 border-solid rounded-md">
              <p className="text-center py-0 my-0">Email Or Password is wrong</p>
            </div>
          )}
            <form
              className="space-y-6"
              action="#"
              method="POST"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    value={data.email}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block !outline-none w-full bg-inherit rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Your email"
                    onChange={(e) =>
                      setData({ ...data, [e.target.name]: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    value={data.password}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="!outline-none block w-full bg-inherit px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Your Password"
                    onChange={(e) =>
                      setData({ ...data, [e.target.name]: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <button
                  disabled={loading ? true : false}
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#241008] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {loading ? "Logging in..." : "Sign in"}
                </button>
              </div>
            </form>

            {/* <p className="mt-10 text-center text-sm text-gray-500">
              Want to create a new admin ?
              <Link
                href="/auth/register"
                className="font-semibold leading-6 px-2 text-indigo-600 hover:text-indigo-500"
              >
                Signup here
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;
