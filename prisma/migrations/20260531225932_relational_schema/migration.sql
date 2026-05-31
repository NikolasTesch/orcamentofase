-- CreateEnum
CREATE TYPE "PriceGroupType" AS ENUM ('SCALAR', 'BRACKET_ROW', 'BRACKET_MATRIX');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('open', 'won', 'lost');

-- CreateTable
CREATE TABLE "price_categories" (
    "id" TEXT NOT NULL,
    "catKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "hasBrackets" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "price_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_brackets" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "price_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_groups" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "groupType" "PriceGroupType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "price_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_entries" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "subKey" TEXT,
    "bracketId" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_charts" (
    "id" TEXT NOT NULL,
    "chartKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "svgType" TEXT NOT NULL,
    "obs" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "size_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_columns" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "size_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_rows" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "sizeKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "size_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_cells" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kitDiscount" INTEGER NOT NULL DEFAULT 0,
    "sportDiscount" INTEGER NOT NULL DEFAULT 0,
    "promoDiscount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoNote" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL DEFAULT '',
    "clientPartnership" TEXT NOT NULL DEFAULT 'Nenhuma',
    "delivery" INTEGER NOT NULL DEFAULT 30,
    "validity" INTEGER NOT NULL DEFAULT 7,
    "notes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partnerDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "additionalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BudgetStatus" NOT NULL DEFAULT 'open',
    "attachSizes" BOOLEAN NOT NULL DEFAULT false,
    "selectedSizeChartId" TEXT,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_line_items" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partnerDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "snap" JSONB NOT NULL,

    CONSTRAINT "budget_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_status_events" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "fromStatus" "BudgetStatus",
    "toStatus" "BudgetStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "budget_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_categories_catKey_key" ON "price_categories"("catKey");

-- CreateIndex
CREATE UNIQUE INDEX "price_groups_categoryId_groupKey_key" ON "price_groups"("categoryId", "groupKey");

-- CreateIndex
CREATE UNIQUE INDEX "price_entries_groupId_subKey_bracketId_key" ON "price_entries"("groupId", "subKey", "bracketId");

-- CreateIndex
CREATE UNIQUE INDEX "size_charts_chartKey_key" ON "size_charts"("chartKey");

-- CreateIndex
CREATE UNIQUE INDEX "size_cells_rowId_columnId_key" ON "size_cells"("rowId", "columnId");

-- CreateIndex
CREATE UNIQUE INDEX "partners_name_key" ON "partners"("name");

-- AddForeignKey
ALTER TABLE "price_groups" ADD CONSTRAINT "price_groups_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "price_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_entries" ADD CONSTRAINT "price_entries_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "price_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_entries" ADD CONSTRAINT "price_entries_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "price_brackets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_columns" ADD CONSTRAINT "size_columns_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "size_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rows" ADD CONSTRAINT "size_rows_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "size_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_cells" ADD CONSTRAINT "size_cells_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "size_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_cells" ADD CONSTRAINT "size_cells_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "size_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line_items" ADD CONSTRAINT "budget_line_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_status_events" ADD CONSTRAINT "budget_status_events_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
