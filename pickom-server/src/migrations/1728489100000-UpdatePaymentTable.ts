import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdatePaymentTable1728489100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make delivery_id nullable
    await queryRunner.changeColumn(
      'payments',
      'delivery_id',
      new TableColumn({
        name: 'delivery_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Make to_user_id nullable
    await queryRunner.changeColumn(
      'payments',
      'to_user_id',
      new TableColumn({
        name: 'to_user_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Update status enum to include 'processing' and 'cancelled'
    await queryRunner.query(`
      ALTER TABLE payments
      MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')
      DEFAULT 'pending'
    `);

    // Add stripe_payment_intent_id
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'stripe_payment_intent_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Add stripe_client_secret
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'stripe_client_secret',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add currency
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'currency',
        type: 'varchar',
        length: '3',
        default: "'usd'",
        isNullable: false,
      }),
    );

    // Add description
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );

    // Add metadata
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'metadata',
        type: 'json',
        isNullable: true,
      }),
    );

    // Add updated_at
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns
    await queryRunner.dropColumn('payments', 'updated_at');
    await queryRunner.dropColumn('payments', 'metadata');
    await queryRunner.dropColumn('payments', 'description');
    await queryRunner.dropColumn('payments', 'currency');
    await queryRunner.dropColumn('payments', 'stripe_client_secret');
    await queryRunner.dropColumn('payments', 'stripe_payment_intent_id');

    // Revert status enum
    await queryRunner.query(`
      ALTER TABLE payments
      MODIFY COLUMN status ENUM('pending', 'completed', 'failed')
      DEFAULT 'pending'
    `);

    // Revert to_user_id to NOT NULL
    await queryRunner.changeColumn(
      'payments',
      'to_user_id',
      new TableColumn({
        name: 'to_user_id',
        type: 'int',
        isNullable: false,
      }),
    );

    // Revert delivery_id to NOT NULL
    await queryRunner.changeColumn(
      'payments',
      'delivery_id',
      new TableColumn({
        name: 'delivery_id',
        type: 'int',
        isNullable: false,
      }),
    );
  }
}
