/*
  Warnings:

  - You are about to drop the column `precio_por_ml` on the `ingredientes` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `producto_recipiente` table. All the data in the column will be lost.
  - Added the required column `actualizado_en` to the `gastos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_por_ml` to the `recetas_producto_ingrediente` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `producto_recipiente` DROP FOREIGN KEY `producto_recipiente_producto_id_fkey`;

-- AlterTable
ALTER TABLE `categorias_ingrediente` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `gastos` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `actualizado_en` DATETIME(3) NOT NULL,
    ADD COLUMN `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ingredientes` DROP COLUMN `precio_por_ml`;

-- AlterTable
ALTER TABLE `producto_recipiente` DROP COLUMN `creado_en`,
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `cantidad_unidades` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `recetas_producto_ingrediente` ADD COLUMN `precio_por_ml` DECIMAL(12, 4) NOT NULL;

-- AlterTable
ALTER TABLE `tipos_recipientes` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `producto_recipiente` ADD CONSTRAINT `producto_recipiente_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos_finales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
