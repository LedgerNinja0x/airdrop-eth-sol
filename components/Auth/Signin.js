"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

const Signin = ({ providers, error }) => {
  console.log(error);
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
      console.log(err);
      alert("Something went wrong. Please try again later");
    }
  }

  return (
    <>
      <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <img class="mx-auto h-10 w-auto" src="/logo.png" alt="Your Company" />
          <h2 class="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Admin Login
          </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
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
            class="space-y-6"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                for="email"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div class="mt-2">
                <input
                  value={data.email}
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block !outline-none w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Your email"
                  onChange={(e) =>
                    setData({ ...data, [e.target.name]: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label
                  for="password"
                  class="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div class="mt-2">
                <input
                  value={data.password}
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  className="!outline-none block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? "Logging in..." : "Sign in"}
              </button>
            </div>
          </form>

          {/* <p class="mt-10 text-center text-sm text-gray-500">
            Want to create a new admin ?
            <Link
              href="/auth/register"
              class="font-semibold leading-6 px-2 text-indigo-600 hover:text-indigo-500"
            >
              Signup here
            </Link>
          </p> */}
        </div>
      </div>
    </>
  );
};

export default Signin;
