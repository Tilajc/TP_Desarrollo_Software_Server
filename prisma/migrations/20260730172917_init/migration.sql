-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "nombre" TEXT NOT NULL DEFAULT 'Sin nombre',
    "descripcion" TEXT NOT NULL DEFAULT 'Sin descripción',

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);
