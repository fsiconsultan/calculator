/* ============================================================
   FSI CONSULTANT - PLTS CALCULATOR
   File: js/items.js

   Fungsi:
   1. Add Item
   2. Remove Item
   3. Edit nama item
   4. Edit Qty
   5. Edit Harga / Item
   6. Format angka otomatis dengan titik ribuan
   7. Hitung Total Harga
   8. Load Default Items
   9. Sinkronisasi ke Costs
   ============================================================ */

(function () {

    "use strict";

    console.log("FSI Items: module mulai loading...");


    /* ============================================================
       1. STATE
       ============================================================ */

    if (!Array.isArray(window.FSI_ITEMS)) {
        window.FSI_ITEMS = [];
    }


    /* ============================================================
       2. UTILITY
       ============================================================ */

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


    /* ------------------------------------------------------------
       Parse number
    ------------------------------------------------------------ */

    function parseItemNumber(value) {

        if (typeof value === "number") {

            return Number.isFinite(value)
                ? value
                : 0;

        }


        let text =
            String(value ?? "")
                .trim();


        if (!text) {
            return 0;
        }


        /*
         * Hapus titik ribuan.
         *
         * Contoh:
         * 2.700.000 -> 2700000
         */

        text =
            text.replace(/\./g, "");


        /*
         * Hapus karakter selain
         * angka dan minus.
         */

        text =
            text.replace(/[^\d-]/g, "");


        const number =
            Number(text);


        return Number.isFinite(number)
            ? number
            : 0;

    }


    /* ------------------------------------------------------------
       Format number
    ------------------------------------------------------------ */

    function formatItemNumber(value) {

        const number =
            Math.max(
                0,
                Math.round(
                    parseItemNumber(value)
                )
            );


        return new Intl.NumberFormat(
            "id-ID",
            {
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    /* ------------------------------------------------------------
       Currency
    ------------------------------------------------------------ */

    function formatItemCurrency(value) {

        const number =
            parseItemNumber(value);


        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    /* ------------------------------------------------------------
       Escape HTML
    ------------------------------------------------------------ */

    function escapeItemHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ============================================================
       3. CREATE ITEM
       ============================================================ */

    function createItem(data = {}) {

        const item = {

            id:
                data.id ||
                generateItemId(),

            name:
                data.name ||
                "",

            qty:
                Math.max(
                    0,
                    parseItemNumber(data.qty) || 1
                ),

            price:
                Math.max(
                    0,
                    parseItemNumber(data.price)
                ),

            total: 0

        };


        item.total =
            item.qty *
            item.price;


        return item;

    }


    /* ============================================================
       4. ADD ITEM
       ============================================================ */

    function addItem(
        data = {},
        render = true
    ) {

        const item =
            createItem(data);


        window.FSI_ITEMS.push(item);


        if (render) {

            renderItems();

        }


        return item;

    }


    /* ============================================================
       5. REMOVE ITEM
       ============================================================ */

    function removeItem(itemId) {

        window.FSI_ITEMS =
            window.FSI_ITEMS.filter(
                item =>
                    item.id !== itemId
            );


        renderItems();

    }


    /* ============================================================
       6. UPDATE ITEM
       ============================================================ */

    function updateItem(
        itemId,
        field,
        value
    ) {

        const item =
            window.FSI_ITEMS.find(
                current =>
                    current.id === itemId
            );


        if (!item) {

            return;

        }


        if (field === "name") {

            item.name =
                String(value ?? "");

        }


        else if (field === "qty") {

            item.qty =
                Math.max(
                    0,
                    parseItemNumber(value)
                );

        }


        else if (field === "price") {

            item.price =
                Math.max(
                    0,
                    parseItemNumber(value)
                );

        }


        item.total =
            item.qty *
            item.price;


        updateItemRow(item);


        triggerItemsChange();

    }


    /* ============================================================
       7. UPDATE SINGLE ROW
       ============================================================ */

    function updateItemRow(item) {

        const rows =
            document.querySelectorAll(
                "[data-item-id]"
            );


        let row = null;


        rows.forEach(
            currentRow => {

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


    /* ============================================================
       8. RENDER ITEMS
       ============================================================ */

    function renderItems() {

        const tbody =
            document.getElementById(
                "itemsTableBody"
            );


        if (!tbody) {

            return;

        }


        tbody.innerHTML = "";


        /*
         * Empty state
         */

        if (
            window.FSI_ITEMS.length === 0
        ) {

            const emptyRow =
                document.createElement(
                    "tr"
                );


            emptyRow.className =
                "empty-table-row";


            emptyRow.innerHTML = `
                <td colspan="6">
                    Belum ada item.
                    Klik "Add Item" untuk menambahkan.
                </td>
            `;


            tbody.appendChild(
                emptyRow
            );


            refreshItemIcons();

            triggerItemsChange();

            return;

        }


        /*
         * Render rows
         */

        window.FSI_ITEMS.forEach(
            (
                item,
                index
            ) => {

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


        refreshItemIcons();


        triggerItemsChange();

    }


    /* ============================================================
       9. CREATE ITEM ROW
       ============================================================ */

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


        row.innerHTML = `

            <!-- NUMBER -->
            <td class="col-no">

                <span class="item-number">
                    ${index + 1}
                </span>

            </td>


            <!-- ITEM NAME -->
            <td>

                <input
                    type="text"
                    class="item-name"
                    value="${escapeItemHtml(item.name)}"
                    placeholder="Nama item"
                    data-field="name"
                    autocomplete="off"
                >

            </td>


            <!-- QTY -->
            <td class="col-qty">

                <input
                    type="number"
                    class="item-qty"
                    value="${item.qty}"
                    min="0"
                    step="1"
                    data-field="qty"
                >

            </td>


            <!-- PRICE -->
            <td class="col-price">

                <input
                    type="text"
                    inputmode="numeric"
                    class="item-price"
                    value="${formatItemNumber(item.price)}"
                    placeholder="0"
                    data-field="price"
                    autocomplete="off"
                >

            </td>


            <!-- TOTAL -->
            <td class="col-total item-total">

                ${formatItemCurrency(item.total)}

            </td>


            <!-- ACTION -->
            <td class="col-action">

                <button
                    type="button"
                    class="delete-row-btn"
                    title="Delete Item"
                    data-action="delete"
                >

                    <i data-lucide="trash-2"></i>

                </button>

            </td>

        `;


        bindItemRowEvents(
            row,
            item
        );


        return row;

    }


    /* ============================================================
       10. BIND ITEM EVENTS
       ============================================================ */

    function bindItemRowEvents(
        row,
        item
    ) {

        const inputs =
            row.querySelectorAll(
                "input"
            );


        inputs.forEach(
            input => {

                const field =
                    input.dataset.field;


                input.addEventListener(
                    "input",
                    function () {

                        if (
                            field === "price"
                        ) {

                            /*
                             * Ambil posisi cursor
                             */

                            const oldValue =
                                input.value;


                            const cursorPosition =
                                input.selectionStart;


                            /*
                             * Hitung berapa angka
                             * sebelum cursor.
                             */

                            const digitsBeforeCursor =
                                oldValue
                                    .slice(
                                        0,
                                        cursorPosition
                                    )
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                                    .length;


                            /*
                             * Parse nilai.
                             */

                            const numericValue =
                                parseItemNumber(
                                    oldValue
                                );


                            /*
                             * Format ulang.
                             */

                            const formattedValue =
                                formatItemNumber(
                                    numericValue
                                );


                            input.value =
                                formattedValue;


                            /*
                             * Pulihkan cursor
                             * berdasarkan jumlah digit.
                             */

                            let newCursor =
                                0;

                            let digitCount =
                                0;


                            for (
                                let i = 0;
                                i < formattedValue.length;
                                i++
                            ) {

                                if (
                                    /\d/.test(
                                        formattedValue[i]
                                    )
                                ) {

                                    digitCount++;

                                }


                                newCursor =
                                    i + 1;


                                if (
                                    digitCount >=
                                    digitsBeforeCursor
                                ) {

                                    break;

                                }

                            }


                            if (
                                digitsBeforeCursor === 0
                            ) {

                                newCursor = 0;

                            }


                            try {

                                input.setSelectionRange(
                                    newCursor,
                                    newCursor
                                );

                            } catch (error) {

                                /*
                                 * Abaikan jika browser
                                 * tidak mengizinkan.
                                 */

                            }


                            updateItem(
                                item.id,
                                field,
                                numericValue
                            );


                            return;

                        }


                        updateItem(
                            item.id,
                            field,
                            input.value
                        );

                    }
                );


                /*
                 * Saat keluar dari input harga,
                 * pastikan format tetap rapi.
                 */

                if (
                    field === "price"
                ) {

                    input.addEventListener(
                        "blur",
                        function () {

                            input.value =
                                formatItemNumber(
                                    item.price
                                );

                        }
                    );

                }

            }
        );


        /*
         * Delete
         */

        const deleteButton =
            row.querySelector(
                '[data-action="delete"]'
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    removeItem(
                        item.id
                    );

                }
            );

        }

    }


    /* ============================================================
       11. GET ITEMS
       ============================================================ */

    function getItems() {

        return window.FSI_ITEMS.map(
            item => ({

                id:
                    item.id,

                name:
                    String(
                        item.name || ""
                    ).trim(),

                qty:
                    Number(
                        item.qty
                    ) || 0,

                price:
                    Number(
                        item.price
                    ) || 0,

                total:
                    (
                        Number(item.qty) || 0
                    ) *
                    (
                        Number(item.price) || 0
                    )

            })
        );

    }


    /* ============================================================
       12. GET TOTAL ITEMS
       ============================================================ */

    function getTotalItems() {

        return getItems().reduce(
            (
                total,
                item
            ) => {

                return total +
                    item.total;

            },
            0
        );

    }


    /* ============================================================
       13. CLEAR ITEMS
       ============================================================ */

    function clearItems() {

        window.FSI_ITEMS = [];

        renderItems();

    }


    /* ============================================================
       14. LOAD DEFAULT ITEMS
       ============================================================ */

    function loadDefaultItems() {

        clearItems();


        const defaults =
            window.FSI_CONFIG &&
            Array.isArray(
                window.FSI_CONFIG.defaultItems
            )
                ? window.FSI_CONFIG.defaultItems
                : [];


        defaults.forEach(
            item => {

                addItem(
                    item,
                    false
                );

            }
        );


        renderItems();

    }


    /* ============================================================
       15. ITEMS CHANGE EVENT
       ============================================================ */

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


    /* ============================================================
       16. REFRESH ICONS
       ============================================================ */

    function refreshItemIcons() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* ============================================================
       17. GLOBAL API
       ============================================================ */

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


    console.log(
        "FSI Items module loaded.",
        window.FSIItems
    );

})();
