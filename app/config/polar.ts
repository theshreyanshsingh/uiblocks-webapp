import { Polar } from "@polar-sh/sdk";
import {
  POLAR_SERVER,
  POLAR_SUCCESS_URL,
  POLAR_TOKEN,
  PRODUCT_ID,
} from "./Config";

// Create checkout function to be called at runtime
export const createCheckout = async ({
  email,
  id,
}: {
  email: string;
  id: string;
}) => {
  if (!POLAR_TOKEN) {
    throw new Error("Polar access token is not configured");
  }

  const polar = new Polar({
    accessToken: POLAR_TOKEN,
    server: POLAR_SERVER as "production",
  });

  return await polar.checkouts.create({
    productId: PRODUCT_ID as string,
    customerEmail: email,
    customerExternalId: id,
    successUrl: POLAR_SUCCESS_URL,
  });
};

// export const verifySubscription = async ({ session }: { session: string }) => {
//   const polar = new Polar({
//     accessToken: "polar_oat_7BTz90s3GYZ33vfD6MKxXg47OMLRy2rmdqqwp0dQ21c",
//     server: "sandbox",
//   });

//   return await polar.subscriptions.get({
//     id: session,
//   });
// };
