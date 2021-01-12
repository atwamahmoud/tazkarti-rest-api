import { expect } from "chai";
import "mocha";
import { returnsTrue } from "../src/moduleToTest";

describe("first test", () => {
    it("Should return true", () => {
        const result: boolean = returnsTrue();
        expect(result).to.equal(true);
    });
});
