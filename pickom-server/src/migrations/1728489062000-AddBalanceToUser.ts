import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBalanceToUser1728489062000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const balanceColumn = table?.findColumnByName('balance');

    if (!balanceColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'balance',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    const balanceColumn = table?.findColumnByName('balance');

    if (balanceColumn) {
      await queryRunner.dropColumn('users', 'balance');
    }
  }
}
