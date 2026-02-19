import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPackageImageUrlToDelivery1764179448597 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "deliveries" ADD COLUMN "package_image_url" TEXT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "deliveries" DROP COLUMN "package_image_url"`
        );
    }

}
