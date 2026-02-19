import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDeliveryLocationFields1729099200000
  implements MigrationInterface
{
  name = 'UpdateDeliveryLocationFields1729099200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'deliveries' AND column_name IN ('from_address', 'to_address')
        `);

    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "from_location" jsonb NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "to_location" jsonb NULL`,
    );

    if (tableExists && tableExists.length > 0) {
      await queryRunner.query(`
                UPDATE "deliveries"
                SET "from_location" = jsonb_build_object(
                    'lat', 0,
                    'lng', 0,
                    'address', COALESCE("from_address", ''),
                    'city', "from_city"
                )
                WHERE "from_address" IS NOT NULL
            `);

      await queryRunner.query(`
                UPDATE "deliveries"
                SET "to_location" = jsonb_build_object(
                    'lat', 0,
                    'lng', 0,
                    'address', COALESCE("to_address", ''),
                    'city', "to_city"
                )
                WHERE "to_address" IS NOT NULL
            `);

      await queryRunner.query(
        `ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "from_address"`,
      );
      await queryRunner.query(
        `ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "from_city"`,
      );
      await queryRunner.query(
        `ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "to_address"`,
      );
      await queryRunner.query(
        `ALTER TABLE "deliveries" DROP COLUMN IF EXISTS "to_city"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "from_address" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "deliveries" ADD "from_city" text`);
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD "to_address" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "deliveries" ADD "to_city" text`);

    await queryRunner.query(`
            UPDATE "deliveries"
            SET "from_address" = COALESCE("from_location"->>'address', ''),
                "from_city" = "from_location"->>'city'
            WHERE "from_location" IS NOT NULL
        `);

    await queryRunner.query(`
            UPDATE "deliveries"
            SET "to_address" = COALESCE("to_location"->>'address', ''),
                "to_city" = "to_location"->>'city'
            WHERE "to_location" IS NOT NULL
        `);

    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP COLUMN "to_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP COLUMN "from_location"`,
    );
  }
}
