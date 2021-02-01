const numTokens = 200;
class TokenGenerator {
  constructor(mockTokens) {
    //TODO: Implement generation of real tokens.
    if (!mockTokens) {
      throw new Exception("Did not implement generating real tokens yet.");
    } else {
      this.tokensList = [];
      for (var i = 0; i < numTokens; i++) {
        this.tokensList.push(i);
      }
    }
    this.currIndex = 0;
  }

  /**
   * Resets the index and makes the generator repeat the
   * tokens it already gave from the start.
   */
  reset() {
    this.currIndex = 0;
    this.uidToSocketIdMap = new Map();
  }

  getNextToken() {
    if (this.currIndex >= numTokens) {
      throw new Exception("Token generator ran out of tokens.");
    }
    let nextToken = this.tokensList[this.currIndex];
    this.currIndex++;
    return nextToken;
  }
}

module.exports = TokenGenerator;
