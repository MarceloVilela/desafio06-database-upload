import { getCustomRepository, TransactionRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepo = getCustomRepository(TransactionsRepository);

    const transactionExists = await transactionsRepo.findOne({
      where: { id },
    });

    if (!transactionExists) {
      throw new AppError(`Transaction ${id} not found`);
    }

    transactionsRepo.delete(transactionExists.id);
  }
}

export default DeleteTransactionService;
