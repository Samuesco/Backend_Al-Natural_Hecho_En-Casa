/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `categorias_ingrediente` table. All the data in the column will be lost.
  - You are about to drop the column `actualizadoEn` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryExpires` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryToken` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `Ingrediente` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actualizado_en` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Ingrediente` DROP FOREIGN KEY `Ingrediente_categoriaId_fkey`;

-- AlterTable
ALTER TABLE `categorias_ingrediente` DROP COLUMN `creadoEn`,
    ADD COLUMN `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `actualizadoEn`,
    DROP COLUMN `creadoEn`,
    DROP COLUMN `recoveryExpires`,
    DROP COLUMN `recoveryToken`,
    ADD COLUMN `actualizado_en` DATETIME(3) NOT NULL,
    ADD COLUMN `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expira_recuperacion` DATETIME(3) NULL,
    ADD COLUMN `token_recuperacion` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Ingrediente`;

-- CreateTable
CREATE TABLE `ingredientes` (
    `id` VARCHAR(191) NOT NULL,
    `categoria_id` INTEGER NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `precio_por_ml` DECIMAL(12, 4) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ingredientes_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos_finales` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `imagen_url` TEXT NULL,
    `cantidad_ml` DECIMAL(10, 2) NOT NULL,
    `porcentaje_ganancia` DECIMAL(5, 2) NOT NULL,
    `porcentaje_perdida` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recetas_producto_ingrediente` (
    `producto_id` VARCHAR(191) NOT NULL,
    `ingrediente_id` VARCHAR(191) NOT NULL,
    `cantidad_ml` DECIMAL(10, 2) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`producto_id`, `ingrediente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_recipientes` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(14, 2) NOT NULL,
    `tamano_recipiente` DECIMAL(14, 2) NOT NULL,

    UNIQUE INDEX `tipos_recipientes_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto_recipiente` (
    `producto_id` VARCHAR(191) NOT NULL,
    `recipiente_id` VARCHAR(191) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`producto_id`, `recipiente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastos` (
    `id` VARCHAR(191) NOT NULL,
    `producto_id` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `valor` DECIMAL(14, 2) NOT NULL,
    `fecha_gasto` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ingredientes` ADD CONSTRAINT `ingredientes_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_ingrediente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recetas_producto_ingrediente` ADD CONSTRAINT `recetas_producto_ingrediente_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos_finales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recetas_producto_ingrediente` ADD CONSTRAINT `recetas_producto_ingrediente_ingrediente_id_fkey` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto_recipiente` ADD CONSTRAINT `producto_recipiente_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos_finales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto_recipiente` ADD CONSTRAINT `producto_recipiente_recipiente_id_fkey` FOREIGN KEY (`recipiente_id`) REFERENCES `tipos_recipientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos_finales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
