/* ============================================================
   FSI CONSULTANT - PLTS CALCULATOR
   File: js/costs.js

   Fungsi:
   1. Add Biaya
   2. Remove Biaya
   3. Edit nama biaya
   4. Edit Qty
   5. Edit Harga / Item
   6. Auto Installation
   7. Auto Aluminium Structure
   8. Sinkronisasi jumlah panel
   9. Format angka otomatis dengan titik ribuan
   10. Hitung Total Biaya
   ============================================================ */


/* ============================================================
   1. COST STATE
   ============================================================ */

if (!Array.isArray(window.FSI_COSTS)) {

    window.FSI_COSTS = [];

}


/* ============================================================
   2. UTILITY
   ============================================================ */

function generateCostId() {

    return (
        "cost-" +
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

function parseCostNumber(value) {

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
     * 936.000 -> 936000
     */

    text =
        text.replace(/\./g, "");


    /*
     * Hapus semua karakter
     * selain angka dan minus.
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

function formatCostNumber(value) {

    const number =
        Math.max(
            0,
            Math.round(
                parseCostNumber(value)
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

function formatCostCurrency(value) {

    const number =
        parseCostNumber(value);


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


/* ============================================================
   3. CREATE COST
   ============================================================ */

function createCost(data = {}) {

    const cost = {

        id:
            data.id ||
            generateCostId(),

        name:
            data.name ||
            "",

        qty:
            Math.max(
                0,
                parseCostNumber(data.qty) || 1
            ),

        price:
            Math.max(
                0,
                parseCostNumber(data.price)
            ),

        total: 0,

        auto:
            data.auto === true,

        formula:
            data.formula ||
            null

    };


    cost.total =
        cost.qty *
        cost.price;


    return cost;

}


/* ============================================================
   4. ADD COST
   ============================================================ */

function addCost(
    data = {},
    render = true
) {

    const cost =
        createCost(data);


    window.FSI_COSTS.push(cost);


    if (render) {

        renderCosts();

    }


    return cost;

}


/* ============================================================
   5. REMOVE COST
   ============================================================ */

function removeCost(costId) {

    window.FSI_COSTS =
        window.FSI_COSTS.filter(
            cost =>
                cost.id !== costId
        );


    renderCosts();

}


/* ============================================================
   6. GET PANEL QUANTITY
   ============================================================ */

function getPanelQuantity() {

    if (
        !window.FSI_ITEMS ||
        !Array.isArray(
            window.FSI_ITEMS
        )
    ) {

        return 0;

    }


    return window.FSI_ITEMS.reduce(
        (
            total,
            item
        ) => {

            const name =
                String(
                    item.name || ""
                ).toLowerCase();


            if (
                name.includes("panel")
            ) {

                return total +
                    (
                        Number(
                            item.qty
                        ) || 0
                    );

            }


            return total;

        },
        0
    );

}


/* ============================================================
   7. GET AUTO COST CONFIG
   ============================================================ */

function getAutoCostConfig(
    formula
) {

    const config =
        window.FSI_CONFIG;


    if (!config) {

        return null;

    }


    if (
        formula ===
        "installation"
    ) {

        return {

            coefficient:
                Number(
                    config.installation?.coefficient
                ) || 0,

            tariff:
                Number(
                    config.installation?.tariff
                ) || 0

        };

    }


    if (
        formula ===
        "aluminium"
    ) {

        return {

            coefficient:
                Number(
                    config.aluminium?.coefficient
                ) || 0,

            tariff:
                Number(
                    config.aluminium?.tariff
                ) || 0

        };

    }


    return null;

}


/* ============================================================
   8. CALCULATE AUTO COST
   ============================================================ */

function calculateAutoCost(
    cost
) {

    const config =
        getAutoCostConfig(
            cost.formula
        );


    if (!config) {

        return;

    }


    const panelQty =
        getPanelQuantity();


    cost.qty =
        panelQty;


    cost.price =
        config.coefficient *
        config.tariff;


    cost.total =
        cost.qty *
        cost.price;

}


/* ============================================================
   9. UPDATE AUTO COSTS
   ============================================================ */

function updateAutoCosts() {

    window.FSI_COSTS.forEach(
        cost => {

            if (
                cost.auto &&
                (
                    cost.formula ===
                        "installation" ||

                    cost.formula ===
                        "aluminium"
                )
            ) {

                calculateAutoCost(
                    cost
                );

            }

        }
    );


    renderCosts();

}


/* ============================================================
   10. UPDATE COST
   ============================================================ */

function updateCost(
    costId,
    field,
    value
) {

    const cost =
        window.FSI_COSTS.find(
            current =>
                current.id === costId
        );


    if (!cost) {

        return;

    }


    /*
     * Auto cost:
     * Qty dan Harga tidak bisa diedit.
     */

    if (
        cost.auto &&
        (
            field === "qty" ||
            field === "price"
        )
    ) {

        return;

    }


    if (
        field === "qty"
    ) {

        cost.qty =
            Math.max(
                0,
                parseCostNumber(value)
            );

    }


    else if (
        field === "price"
    ) {

        cost.price =
            Math.max(
                0,
                parseCostNumber(value)
            );

    }


    else if (
        field === "name"
    ) {

        cost.name =
            String(value ?? "");

    }


    cost.total =
        cost.qty *
        cost.price;


    updateCostRow(
        cost
    );

}


/* ============================================================
   11. TOGGLE AUTO
   ============================================================ */

function toggleCostAuto(
    costId,
    enabled
) {

    const cost =
        window.FSI_COSTS.find(
            current =>
                current.id === costId
        );


    if (!cost) {

        return;

    }


    cost.auto =
        enabled === true;


    if (cost.auto) {

        if (!cost.formula) {

            cost.auto = false;

        }

    }


    if (cost.auto) {

        calculateAutoCost(
            cost
        );

    }


    renderCosts();

}


/* ============================================================
   12. UPDATE SINGLE ROW
   ============================================================ */

function updateCostRow(
    cost
) {

    const rows =
        document.querySelectorAll(
            "[data-cost-id]"
        );


    let row = null;


    rows.forEach(
        currentRow => {

            if (
                currentRow.getAttribute(
                    "data-cost-id"
                ) === cost.id
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
            ".cost-total"
        );


    if (totalElement) {

        totalElement.textContent =
            formatCostCurrency(
                cost.total
            );

    }


    triggerCostsChange();

}


/* ============================================================
   13. RENDER COSTS
   ============================================================ */

function renderCosts() {

    const tbody =
        document.getElementById(
            "costsTableBody"
        );


    if (!tbody) {

        return;

    }


    /*
     * Update auto cost sebelum render.
     */

    window.FSI_COSTS.forEach(
        cost => {

            if (
                cost.auto &&
                (
                    cost.formula ===
                        "installation" ||

                    cost.formula ===
                        "aluminium"
                )
            ) {

                calculateAutoCost(
                    cost
                );

            }

        }
    );


    tbody.innerHTML = "";


    /*
     * Empty state
     */

    if (
        window.FSI_COSTS.length === 0
    ) {

        const emptyRow =
            document.createElement(
                "tr"
            );


        emptyRow.className =
            "empty-table-row";


        emptyRow.innerHTML = `
            <td colspan="6">
                Belum ada biaya.
                Klik "Add Biaya" untuk menambahkan.
            </td>
        `;


        tbody.appendChild(
            emptyRow
        );


        refreshCostIcons();

        triggerCostsChange();

        return;

    }


    /*
     * Render rows
     */

    window.FSI_COSTS.forEach(
        (
            cost,
            index
        ) => {

            const row =
                createCostRow(
                    cost,
                    index
                );


            tbody.appendChild(
                row
            );

        }
    );


    refreshCostIcons();


    triggerCostsChange();

}


/* ============================================================
   14. CREATE COST ROW
   ============================================================ */

function createCostRow(
    cost,
    index
) {

    const row =
        document.createElement(
            "tr"
        );


    row.setAttribute(
        "data-cost-id",
        cost.id
    );


    const isAutoCost =
        cost.auto === true &&
        (
            cost.formula ===
                "installation" ||

            cost.formula ===
                "aluminium"
        );


    let autoLabel = "";


    if (isAutoCost) {

        autoLabel = `
            <span
                class="cost-auto-label"
                title="Otomatis berdasarkan jumlah panel"
            >
                AUTO
            </span>
        `;

    }


    row.innerHTML = `

        <!-- NUMBER -->
        <td class="col-no">

            <span class="cost-number">
                ${index + 1}
            </span>

        </td>


        <!-- COST NAME -->
        <td>

            <div class="cost-name-wrapper">

                <input
                    type="text"
                    class="cost-name"
                    value="${escapeCostHtml(cost.name)}"
                    placeholder="Nama biaya"
                    data-field="name"
                    autocomplete="off"
                >

                ${autoLabel}

            </div>

        </td>


        <!-- QTY -->
        <td class="col-qty">

            <input
                type="number"
                class="cost-qty"
                value="${cost.qty}"
                min="0"
                step="1"
                data-field="qty"
                ${isAutoCost ? "readonly" : ""}
            >

        </td>


        <!-- PRICE -->
        <td class="col-price">

            <input
                type="text"
                inputmode="numeric"
                class="cost-price"
                value="${formatCostNumber(cost.price)}"
                placeholder="0"
                data-field="price"
                autocomplete="off"
                ${isAutoCost ? "readonly" : ""}
            >

        </td>


        <!-- TOTAL -->
        <td
            class="col-total cost-total"
        >

            ${formatCostCurrency(cost.total)}

        </td>


        <!-- ACTION -->
        <td class="col-action">

            <button
                type="button"
                class="delete-row-btn"
                title="Delete Biaya"
                data-action="delete"
            >

                <i data-lucide="trash-2"></i>

            </button>

        </td>

    `;


    bindCostRowEvents(
        row,
        cost
    );


    return row;

}


/* ============================================================
   15. BIND COST ROW EVENTS
   ============================================================ */

function bindCostRowEvents(
    row,
    cost
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

                    /*
                     * Format Harga / Item
                     */

                    if (
                        field === "price"
                    ) {

                        /*
                         * Jika readonly,
                         * jangan proses input.
                         */

                        if (
                            input.readOnly
                        ) {

                            return;

                        }


                        const oldValue =
                            input.value;


                        const cursorPosition =
                            input.selectionStart;


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


                        const numericValue =
                            parseCostNumber(
                                oldValue
                            );


                        const formattedValue =
                            formatCostNumber(
                                numericValue
                            );


                        input.value =
                            formattedValue;


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


                        updateCost(
                            cost.id,
                            field,
                            numericValue
                        );


                        return;

                    }


                    /*
                     * Name / Qty
                     */

                    updateCost(
                        cost.id,
                        field,
                        input.value
                    );

                }
            );


            /*
             * Rapikan kembali saat blur.
             */

            if (
                field === "price"
            ) {

                input.addEventListener(
                    "blur",
                    function () {

                        input.value =
                            formatCostNumber(
                                cost.price
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

                removeCost(
                    cost.id
                );

            }
        );

    }

}


/* ============================================================
   16. GET COSTS
   ============================================================ */

function getCosts() {

    return window.FSI_COSTS.map(
        cost => ({

            id:
                cost.id,

            name:
                String(
                    cost.name || ""
                ).trim(),

            qty:
                Number(
                    cost.qty
                ) || 0,

            price:
                Number(
                    cost.price
                ) || 0,

            total:
                (
                    Number(cost.qty) || 0
                ) *
                (
                    Number(cost.price) || 0
                ),

            auto:
                cost.auto === true,

            formula:
                cost.formula || null

        })
    );

}


/* ============================================================
   17. GET TOTAL COSTS
   ============================================================ */

function getTotalCosts() {

    return getCosts().reduce(
        (
            total,
            cost
        ) => {

            return total +
                cost.total;

        },
        0
    );

}


/* ============================================================
   18. CLEAR COSTS
   ============================================================ */

function clearCosts() {

    window.FSI_COSTS = [];

    renderCosts();

}


/* ============================================================
   19. LOAD DEFAULT COSTS
   ============================================================ */

function loadDefaultCosts() {

    clearCosts();


    const defaults =
        window.FSI_CONFIG &&
        Array.isArray(
            window.FSI_CONFIG.defaultCosts
        )
            ? window.FSI_CONFIG.defaultCosts
            : [];


    defaults.forEach(
        cost => {

            addCost(
                cost,
                false
            );

        }
    );


    renderCosts();

}


/* ============================================================
   20. ADD MANUAL COST
   ============================================================ */

function addManualCost() {

    return addCost({

        name: "",

        qty: 1,

        price: 0,

        auto: false,

        formula: null

    });

}


/* ============================================================
   21. ADD AUTO INSTALLATION
   ============================================================ */

function addInstallationCost() {

    return addCost({

        name:
            window.FSI_CONFIG
                ?.installation
                ?.name ||
            "Installation",

        qty:
            getPanelQuantity(),

        price: 0,

        auto: true,

        formula:
            "installation"

    });

}


/* ============================================================
   22. ADD AUTO ALUMINIUM
   ============================================================ */

function addAluminiumCost() {

    return addCost({

        name:
            window.FSI_CONFIG
                ?.aluminium
                ?.name ||
            "Aluminium Structure",

        qty:
            getPanelQuantity(),

        price: 0,

        auto: true,

        formula:
            "aluminium"

    });

}


/* ============================================================
   23. PANEL CHANGE HANDLER
   ============================================================ */

document.addEventListener(
    "fsi:items-changed",
    function () {

        let changed = false;


        window.FSI_COSTS.forEach(
            cost => {

                if (
                    cost.auto &&
                    (
                        cost.formula ===
                            "installation" ||

                        cost.formula ===
                            "aluminium"
                    )
                ) {

                    calculateAutoCost(
                        cost
                    );

                    changed = true;

                }

            }
        );


        if (changed) {

            renderCosts();

        }

    }
);


/* ============================================================
   24. COST CHANGE EVENT
   ============================================================ */

function triggerCostsChange() {

    document.dispatchEvent(
        new CustomEvent(
            "fsi:costs-changed",
            {
                detail: {

                    costs:
                        getCosts(),

                    total:
                        getTotalCosts()

                }
            }
        )
    );

}


/* ============================================================
   25. REFRESH ICONS
   ============================================================ */

function refreshCostIcons() {

    if (
        window.lucide &&
        typeof window.lucide.createIcons ===
            "function"
    ) {

        window.lucide.createIcons();

    }

}


/* ============================================================
   26. ESCAPE HTML
   ============================================================ */

function escapeCostHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   27. GLOBAL API
   ============================================================ */

window.FSICosts = {

    add:
        addCost,

    addManual:
        addManualCost,

    addInstallation:
        addInstallationCost,

    addAluminium:
        addAluminiumCost,

    remove:
        removeCost,

    update:
        updateCost,

    toggleAuto:
        toggleCostAuto,

    getAll:
        getCosts,

    getTotal:
        getTotalCosts,

    getPanelQuantity:
        getPanelQuantity,

    updateAuto:
        updateAutoCosts,

    clear:
        clearCosts,

    loadDefaults:
        loadDefaultCosts,

    render:
        renderCosts

};


console.log(
    "FSI Costs module loaded.",
    window.FSICosts
);
