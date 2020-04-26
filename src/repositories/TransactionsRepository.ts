import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    function reducerTransaction(accumulator: number, value: number): number {
      return accumulator + value;
    }

    const transactionsIncome = await this.find({
      where: { type: 'income' },
    });

    const transactionsOutcome = await this.find({
      where: { type: 'outcome' },
    });

    const income =
      transactionsIncome.length > 0
        ? transactionsIncome.map(item => item.value).reduce(reducerTransaction)
        : 0;
    const outcome =
      transactionsOutcome.length > 0
        ? transactionsOutcome.map(item => item.value).reduce(reducerTransaction)
        : 0;
    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
