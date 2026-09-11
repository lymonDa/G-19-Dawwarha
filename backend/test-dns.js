console.log("Test started");

import dns from "dns";

console.log("DNS imported");

dns.setServers(["8.8.8.8", "1.1.1.1"]);


  dns.promises
  .resolveSrv("_mongodb._tcp.g-19-dawarha-db.lahf3uu.mongodb.net")
  .then((result) => {
    console.log("DNS RESULT:");
    console.log(result);
  })
  .catch((error) => {
    console.log("DNS ERROR:");
    console.error(error);
  });
  