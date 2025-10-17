import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecipientIdToChatSession1760652580193 implements MigrationInterface {
    name = 'AddRecipientIdToChatSession1760652580193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_sessions" ADD "recipient_id" integer`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" ADD CONSTRAINT "FK_chat_sessions_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_sessions" DROP CONSTRAINT "FK_chat_sessions_recipient"`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" DROP COLUMN "recipient_id"`);
    }

}
