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
    // PostgreSQL: Drop and recreate the enum type
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status TYPE varchar(20) USING status::text
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS payments_status_enum
    `);
    await queryRunner.query(`
      CREATE TYPE payments_status_enum AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status TYPE payments_status_enum USING status::payments_status_enum
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'pending'
    `);

    // Add stripe_payment_intent_id if not exists
    const hasStripePaymentIntentId = await queryRunner.hasColumn('payments', 'stripe_payment_intent_id');
    if (!hasStripePaymentIntentId) {
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
    }

    // Add stripe_client_secret if not exists
    const hasStripeClientSecret = await queryRunner.hasColumn('payments', 'stripe_client_secret');
    if (!hasStripeClientSecret) {
      await queryRunner.addColumn(
        'payments',
        new TableColumn({
          name: 'stripe_client_secret',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // Add currency if not exists
    const hasCurrency = await queryRunner.hasColumn('payments', 'currency');
    if (!hasCurrency) {
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
    }

    // Add description if not exists
    const hasDescription = await queryRunner.hasColumn('payments', 'description');
    if (!hasDescription) {
      await queryRunner.addColumn(
        'payments',
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // Add metadata if not exists
    const hasMetadata = await queryRunner.hasColumn('payments', 'metadata');
    if (!hasMetadata) {
      await queryRunner.addColumn(
        'payments',
        new TableColumn({
          name: 'metadata',
          type: 'json',
          isNullable: true,
        }),
      );
    }

    // Add updated_at if not exists
    const hasUpdatedAt = await queryRunner.hasColumn('payments', 'updated_at');
    if (!hasUpdatedAt) {
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
    // PostgreSQL: Drop and recreate the enum type
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status TYPE varchar(20) USING status::text
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS payments_status_enum
    `);
    await queryRunner.query(`
      CREATE TYPE payments_status_enum AS ENUM('pending', 'completed', 'failed')
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status TYPE payments_status_enum USING status::payments_status_enum
    `);
    await queryRunner.query(`
      ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'pending'
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
