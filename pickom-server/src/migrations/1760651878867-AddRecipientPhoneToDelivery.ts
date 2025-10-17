import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecipientPhoneToDelivery1760651878867 implements MigrationInterface {
    name = 'AddRecipientPhoneToDelivery1760651878867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deliveries" ADD "recipient_phone" character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deliveries" DROP COLUMN "recipient_phone"`);
    }

}
