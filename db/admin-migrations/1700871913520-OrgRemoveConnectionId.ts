import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrgRemoveConnectionId1700871913520 implements MigrationInterface {
  name = 'OrgRemoveConnectionId1700871913520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP CONSTRAINT "UQ_4096cb5091b0c5b592e8fea07c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "auth0_connection_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "auth0_connection_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD CONSTRAINT "UQ_4096cb5091b0c5b592e8fea07c9" UNIQUE ("auth0_connection_id")`,
    );
  }
}
