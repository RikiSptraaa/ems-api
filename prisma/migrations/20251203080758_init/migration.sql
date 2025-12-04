-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "position" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "refresh_token" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "age" INTEGER NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "salary" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_id_key" ON "employees"("id");

INSERT INTO "users" ("id", "email", "full_name", "position", "password", "address", "updated_at") VALUES ('4fd16039-d9eb-4e76-a30e-3fdaf2ff11233', 'AdminHR@yopmail.com', 'Admin HR', 'HR', '$2a$10$0VCiXIOv80oBy8q7Y90DPOoSadbyp0lkLfDaa2AG6cnJ/aOwYwQee' , 'Jakarta, Indonesia', '2025-12-02 42:39.1' )

