import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAboutAndLocationToUser1760465353226 implements MigrationInterface {
    name = 'AddAboutAndLocationToUser1760465353226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "about" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "location" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "about"`);
    }

}
