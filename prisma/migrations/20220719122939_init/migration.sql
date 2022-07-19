-- AlterTable
CREATE SEQUENCE "hobby_id_seq";
ALTER TABLE "Hobby" ALTER COLUMN "id" SET DEFAULT nextval('hobby_id_seq');
ALTER SEQUENCE "hobby_id_seq" OWNED BY "Hobby"."id";
