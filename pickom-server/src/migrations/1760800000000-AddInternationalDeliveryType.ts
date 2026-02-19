import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternationalDeliveryType1760800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'international' to the delivery_type enum
    await queryRunner.query(`
      ALTER TYPE "deliveries_delivery_type_enum"
      ADD VALUE IF NOT EXISTS 'international'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // This would require recreating the enum type and the column
    // For simplicity, we'll leave the enum value in place on rollback
    console.log(
      'Rollback not implemented: PostgreSQL does not support removing enum values',
    );
  }
}
