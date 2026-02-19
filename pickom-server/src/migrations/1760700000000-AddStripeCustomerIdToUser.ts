import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeCustomerIdToUser1760700000000
  implements MigrationInterface
{
  name = 'AddStripeCustomerIdToUser1760700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before adding
    const table = await queryRunner.getTable('users');
    const column = table?.findColumnByName('stripe_customer_id');

    if (!column) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "stripe_customer_id" varchar`,
      );
    }

    // Create unique index (IF NOT EXISTS is safe for indexes)
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_stripe_customer_id" ON "users" ("stripe_customer_id") WHERE "stripe_customer_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_users_stripe_customer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_customer_id"`,
    );
  }
}
