import PocketBase from "pocketbase";
import { PB_URL } from "./constant/url";

const pb = new PocketBase(PB_URL);

pb.authStore.onChange((auth) => {
  console.log("Auth changes", auth);
  console.log(pb.authStore.record)
})

export default pb;
