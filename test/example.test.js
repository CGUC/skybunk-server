const chai = require("chai");

const { expect } = chai;

/**
 * This is where the testing happens! If you're not familiar with unit testing, first go find
 * out why it's important (you can start here:
 * https://dzone.com/articles/top-8-benefits-of-unit-testing)
 *
 * We use the mocha framework for server-side testing (https://mochajs.org/), and the chai
 * library for assertions (http://www.chaijs.com/).
 *
 * All test files should be kept in the API/test folder, and can be run with 'npm test' from
 * your console. To avoid running all tests, write 'describe.only' on the tests you want to run.
 * MAKE SURE TO REMOVE ALL '.only's BEFORE COMMITING YOUR CHANGES! (What you're testing is likely
 * not the same as what someone else wants to be testing, be nice and clean up after yourself!)
 *
 * Here's some more reading on testing with mocha:
 * - https://www.codementor.io/davidtang/unit-testing-and-tdd-in-node-js-part-1-8t714s877
 */
describe("Example Test", () => {
  it("Big Shaq should be right", () => {
    expect(2 + 2).to.equal(4);
    expect(4 - 1).to.equal(3);
    // Quick maths!
  });
});
