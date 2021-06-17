'use strict'

class AccountEntity {
  constructor(id, baseLineBalance) {
    this._id = id;
    this._baseLineBalance = baseLineBalance;
    this.transactions = []
  }

  get id() {
    return this._id;
  }

  calculateBalance() {
    return this._baseLineBalance + this.transactions.reduce((sum, transaction) => sum + transaction, 0)
  }

  canWithdraw(amount) {
    return this.calculateBalance() - amount >= 0
  }

  withdraw(amount) {
    if (!this.canWithdraw(amount)) {
      return false
    }

    this.transactions.push(-amount);
    return true;
  }

  deposit(amount) {
    this.transactions.push(amount);
  }
}

module.exports = {
  AccountEntity
}
