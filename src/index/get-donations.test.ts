import fs from "fs";
import path from "path";
import { getDonations } from "./get-donations";

async function getHtml(): Promise<string> {
  return fs.readFileSync(
    path.resolve(__dirname, "./get-donations.test.data"),
    "utf-8"
  );
}

it("should parse donations from html", async () => {
  expect(await getDonations({ getHtml })).toMatchObject([
    { name: "Foo Alpha", amount: "$50.00", username: undefined },
    { name: "Foo Bravo", amount: "$100.00", username: "bravotv" },
    { name: "Anonymous", amount: "$50.00", username: "user" },
    { name: "Foo Charlie", amount: "$100.00", username: undefined },
    { name: "Foo Delta", amount: "$5.00", username: undefined },
  ]);
});
