/* ============================================================
   FSI CONSULTANT - PLTS CALCULATOR
   File: js/items.js

   FUNGSI:
   1. Add Item
   2. Remove Item
   3. Edit Item Name
   4. Edit Qty
   5. Edit Harga / Item
   6. Hitung Total otomatis
   7. Update nomor item
   8. Global items state
   9. Event fsi:items-changed
   ============================================================ */

(function () {

    "use strict";

    console.log("FSI Items: module mulai loading...");


    /* ========================================================
       1. ITEM STATE
       ======================================================== */

    window.FSI_ITEMS = Array.isArray(window.FSI_ITEMS)
        ? window.FSI_ITEMS
        : [];


    /* ========================================================
       2. UTILITY
       ======================================================== */

    function generateItemId() {

        return (
            "item-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }


    function parseItemNumber(value) {

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : 0;

    }


    function formatItemCurrency(value) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0);

    }


    /* ========================================================
       3. CREATE ITEM
       ======================================================== */

    function createItem(data = {}) {

        const qtyValue =
            parseItemNumber(data.qty);

        const priceValue =
            parseItemNumber(data.price);

        const item = {

            id:
                data.id ||
                generateItemId(),

            name:
                data.name !== undefined
                    ? String(data.name)
                    : "",

            qty:
                Math.max(
                    1,
                    qtyValue || 1
                ),

            price:
                Math.max(
                    0,
                    priceValue
                ),

            total: 0

        };


        item.total =
            item.qty *
            item.price;


        return item;

    }


    /* ========================================================
       4. ADD ITEM
       ======================================================== */

    function addItem(
        data = {},
        shouldRender = true
    ) {

        const item =
            createItem(data);


        window.FSI_ITEMS.push(item);


        console.log(
            "FSI Items: item ditambahkan",
            item
        );


        if (shouldRender) {

            renderItems();

        }


        return item;

    }


    /* ========================================================
       5. REMOVE ITEM
       ======================================================== */

    function removeItem(itemId) {

        window.FSI_ITEMS =
            window.FSI_ITEMS.filter(
                function (item) {

                    return item.id !== itemId;

                }
            );


        renderItems();

    }


    /* ========================================================
       6. UPDATE ITEM
       ======================================================== */

    function updateItem(
        itemId,
        field,
        value
    ) {

        const item =
            window.FSI_ITEMS.find(
                function (currentItem) {

                    return currentItem.id === itemId;

                }
            );


        if (!item) {

            console.warn(
                "FSI Items: item tidak ditemukan:",
                itemId
            );

            return;

        }


        /* NAME */

        if (field === "name") {

            item.name =
                String(value);

        }


        /* QTY */

        else if (field === "qty") {

            const qty =
                parseItemNumber(value);

            item.qty =
                Math.max(
                    1,
                    qty || 1
                );

        }


        /* PRICE */

        else if (field === "price") {

            const price =
                parseItemNumber(value);

            item.price =
                Math.max(
                    0,
                    price
                );

        }


        /* TOTAL */

        item.total =
            item.qty *
            item.price;


        /*
         * Hanya update angka total.
         * Jangan render ulang seluruh row karena
         * cursor input bisa hilang.
         */

        updateItemRow(item);

        updateItemsTotalDisplay();

        triggerItemsChange();

    }


    /* ========================================================
       7. UPDATE SINGLE ROW
       ======================================================== */

    function updateItemRow(item) {

        const rows =
            document.querySelectorAll(
                "#itemsTableBody tr[data-item-id]"
            );


        let row = null;


        rows.forEach(
            function (currentRow) {

                if (
                    currentRow.getAttribute(
                        "data-item-id"
                    ) === item.id
                ) {

                    row = currentRow;

                }

            }
        );


        if (!row) {

            return;

        }


        const totalElement =
            row.querySelector(
                ".item-total"
            );


        if (totalElement) {

            totalElement.textContent =
                formatItemCurrency(
                    item.total
                );

        }

    }


    /* ========================================================
       8. UPDATE TOTAL DISPLAY
       ======================================================== */

    function updateItemsTotalDisplay() {

        const total =
            getTotalItems();


        const totalElement =
            document.getElementById(
                "totalItems"
            );


        if (totalElement) {

            totalElement.textContent =
                formatItemCurrency(
                    total
                );

        }


        const summaryElement =
            document.getElementById(
                "summaryTotalItems"
            );


        if (summaryElement) {

            summaryElement.textContent =
                formatItemCurrency(
                    total
                );

        }

    }


    /* ========================================================
       9. RENDER ITEMS
       ======================================================== */

    function renderItems() {

        const tbody =
            document.getElementById(
                "itemsTableBody"
            );


        if (!tbody) {

            console.warn(
                "FSI Items: #itemsTableBody tidak ditemukan."
            );

            return;

        }


        tbody.innerHTML = "";


        /* EMPTY */

        if (
            window.FSI_ITEMS.length === 0
        ) {

            const emptyRow =
                document.createElement(
                    "tr"
                );


            emptyRow.className =
                "empty-table-row";


            const emptyCell =
                document.createElement(
                    "td"
                );


            emptyCell.colSpan = 6;


            emptyCell.textContent =
                'Belum ada item. Klik "Add Item" untuk menambahkan.';


            emptyRow.appendChild(
                emptyCell
            );


            tbody.appendChild(
                emptyRow
            );


            updateItemsTotalDisplay();

            triggerItemsChange();

            refreshItemIcons();

            return;

        }


        /* ITEMS */

        window.FSI_ITEMS.forEach(
            function (item, index) {

                item.total =
                    item.qty *
                    item.price;


                const row =
                    createItemRow(
                        item,
                        index
                    );


                tbody.appendChild(
                    row
                );

            }
        );


        updateItemsTotalDisplay();

        refreshItemIcons();

        triggerItemsChange();

    }


    /* ========================================================
       10. CREATE ITEM ROW
       ======================================================== */

    function createItemRow(
        item,
        index
    ) {

        const row =
            document.createElement(
                "tr"
            );


        row.setAttribute(
            "data-item-id",
            item.id
        );


        /* ====================================================
           NUMBER
           ==================================================== */

        const numberCell =
            document.createElement(
                "td"
            );

        numberCell.className =
            "col-no";


        const numberSpan =
            document.createElement(
                "span"
            );

        numberSpan.className =
            "item-number";


        numberSpan.textContent =
            index + 1;


        numberCell.appendChild(
            numberSpan
        );


        /* ====================================================
           NAME
           ==================================================== */

        const nameCell =
            document.createElement(
                "td"
            );

        nameCell.className =
            "col-name";


        const nameInput =
            document.createElement(
                "input"
            );

        nameInput.type = "text";

        nameInput.className =
            "item-name";

        nameInput.value =
            item.name;

        nameInput.placeholder =
            "Nama item";

        nameInput.autocomplete =
            "off";


        nameCell.appendChild(
            nameInput
        );


        /* ====================================================
           QTY
           ==================================================== */

        const qtyCell =
            document.createElement(
                "td"
            );

        qtyCell.className =
            "col-qty";


        const qtyInput =
            document.createElement(
                "input"
            );

        qtyInput.type = "number";

        qtyInput.className =
            "item-qty";

        qtyInput.value =
            item.qty;

        qtyInput.min = "1";

        qtyInput.step = "1";


        qtyCell.appendChild(
            qtyInput
        );


        /* ====================================================
           PRICE
           ==================================================== */

        const priceCell =
            document.createElement(
                "td"
            );

        priceCell.className =
            "col-price";


        const priceInput =
            document.createElement(
                "input"
            );

        priceInput.type = "number";

        priceInput.className =
            "item-price";

        priceInput.value =
            item.price;

        priceInput.min = "0";

        priceInput.step = "1000";


        priceCell.appendChild(
            priceInput
        );


        /* ====================================================
           TOTAL
           ==================================================== */

        const totalCell =
            document.createElement(
                "td"
            );

        totalCell.className =
            "col-total";


        const totalSpan =
            document.createElement(
                "span"
            );

        totalSpan.className =
            "item-total";


        totalSpan.textContent =
            formatItemCurrency(
                item.total
            );


        totalCell.appendChild(
            totalSpan
        );


        /* ====================================================
           DELETE
           ==================================================== */

        const actionCell =
            document.createElement(
                "td"
            );

        actionCell.className =
            "col-action";


        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.type =
            "button";

        deleteButton.className =
            "delete-row-btn";

        deleteButton.title =
            "Hapus Item";

        deleteButton.setAttribute(
            "aria-label",
            "Hapus Item"
        );


        const icon =
            document.createElement(
                "i"
            );

        icon.setAttribute(
            "data-lucide",
            "trash-2"
        );


        deleteButton.appendChild(
            icon
        );


        actionCell.appendChild(
            deleteButton
        );


        /* ====================================================
           APPEND CELLS
           ==================================================== */

        row.appendChild(
            numberCell
        );

        row.appendChild(
            nameCell
        );

        row.appendChild(
            qtyCell
        );

        row.appendChild(
            priceCell
        );

        row.appendChild(
            totalCell
        );

        row.appendChild(
            actionCell
        );


        /* ====================================================
           EVENTS
           ==================================================== */

        bindItemRowEvents(
            row,
            item,
            nameInput,
            qtyInput,
            priceInput,
            deleteButton
        );


        return row;

    }


    /* ========================================================
       11. BIND EVENTS
       ======================================================== */

    function bindItemRowEvents(
        row,
        item,
        nameInput,
        qtyInput,
        priceInput,
        deleteButton
    ) {


        /* NAME */

        nameInput.addEventListener(
            "input",
            function (event) {

                updateItem(
                    item.id,
                    "name",
                    event.target.value
                );

            }
        );


        /* QTY */

        qtyInput.addEventListener(
            "input",
            function (event) {

                updateItem(
                    item.id,
                    "qty",
                    event.target.value
                );

            }
        );


        /* PRICE */

        priceInput.addEventListener(
            "input",
            function (event) {

                updateItem(
                    item.id,
                    "price",
                    event.target.value
                );

            }
        );


        /* DELETE */

        deleteButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                removeItem(
                    item.id
                );

            }
        );

    }


    /* ========================================================
       12. GET ITEMS
       ======================================================== */

    function getItems() {

        return window.FSI_ITEMS.map(
            function (item) {

                const qty =
                    Number(item.qty) || 0;


                const price =
                    Number(item.price) || 0;


                return {

                    id:
                        item.id,

                    name:
                        String(
                            item.name || ""
                        ).trim(),

                    qty:
                        qty,

                    price:
                        price,

                    total:
                        qty * price

                };

            }
        );

    }


    /* ========================================================
       13. GET TOTAL
       ======================================================== */

    function getTotalItems() {

        return getItems().reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    item.total
                );

            },
            0
        );

    }


    /* ========================================================
       14. CLEAR
       ======================================================== */

    function clearItems() {

        window.FSI_ITEMS = [];

        renderItems();

    }


    /* ========================================================
       15. LOAD DEFAULT ITEMS
       ======================================================== */

    function loadDefaultItems() {

        window.FSI_ITEMS = [];


        const config =
            window.FSI_CALCULATOR_CONFIG ||
            window.FSI_CONFIG ||
            {};


        const defaults =
            Array.isArray(
                config.defaultItems
            )
                ? config.defaultItems
                : [];


        defaults.forEach(
            function (item) {

                addItem(
                    item,
                    false
                );

            }
        );


        renderItems();

    }


    /* ========================================================
       16. GLOBAL CHANGE EVENT
       ======================================================== */

    function triggerItemsChange() {

        document.dispatchEvent(
            new CustomEvent(
                "fsi:items-changed",
                {
                    detail: {

                        items:
                            getItems(),

                        total:
                            getTotalItems()

                    }
                }
            )
        );

    }


    /* ========================================================
       17. LUCIDE
       ======================================================== */

    function refreshItemIcons() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* ========================================================
       18. PUBLIC API
       ======================================================== */

    window.FSIItems = {

        add:
            addItem,

        remove:
            removeItem,

        update:
            updateItem,

        getAll:
            getItems,

        getTotal:
            getTotalItems,

        clear:
            clearItems,

        loadDefaults:
            loadDefaultItems,

        render:
            renderItems

    };


    /* ========================================================
       19. MODULE READY
       ======================================================== */

    console.log(
        "FSI Items module loaded.",
        window.FSIItems
    );


})();
