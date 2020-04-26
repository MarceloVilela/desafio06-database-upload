import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

class CreateTransactionService {
  public async execute({
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

export default CreateTransactionService;
