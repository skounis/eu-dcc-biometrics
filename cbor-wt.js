const payload = { iss: "coap://as.example.com", sub: "erikw", aud: "coap://light.example.com", exp: 1444064944, nbf: 1443944944, iat: 1443944944, cti: Buffer.from("0b71", "hex") };
const secret = "my-test-secret";
cwt.mac(payload, secret).then((token) => {
    console.log(token);
});