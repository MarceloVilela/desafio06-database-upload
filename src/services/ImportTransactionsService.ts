import path from 'path';
import { getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import loadCSV from '../utils/loadCSV';
import AppError from '../errors/AppError';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const transactionsToCreate = await loadCSV(csvFilePath);

    const functions = transactionsToCreate.map(item => () => this.create(item));

    const serial = (funcs: Function[]): Promise<Transaction[]> =>
      funcs.reduce(
        (promise, func) =>
          promise.then(result =>
            func().then(Array.prototype.concat.bind(result)),
          ),
        Promise.resolve([]),
      );

    return serial(functions).then();
  }

  private async create({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('without a valid balance');
    }

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id = null;

    if (!categoryExists) {
      const categoryCreated = await categoriesRepository.create({
        title: category,
      });

      const categorySaved = await categoriesRepository.save(categoryCreated);

      category_id = categorySaved.id;
    } else {
      category_id = categoryExists.id;
    }

    const transactionSaved = transactionsRepository.create({
      title,
      value,
      type,
      category: category_id,
    });

    return transactionsRepository.save(transactionSaved);
  }
}

export default ImportTransactionsService;
