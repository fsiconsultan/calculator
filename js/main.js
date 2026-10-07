```javascript
// ============================================================
// FSI CALCULATOR - MAIN APPLICATION
// ============================================================
//
// Fungsi utama:
// 1. Initialize seluruh calculator
// 2. Load default items
// 3. Load default costs
// 4. Add Item
// 5. Add Biaya
// 6. Reset Calculator
// 7. Sinkronisasi calculation
// 8. Sinkronisasi quotation
// 9. Refresh Lucide icons
// 10. Button protection
// 11. Debug helper
//
// ============================================================

(function () {

    "use strict";


    // ========================================================
    // STATE
    // ========================================================

    window.FSI_MAIN_STATE =
        window.FSI_MAIN_STATE || {
            initialized: false,
            buttonsBound: false
        };


    // ========================================================
    // HELPERS
    // ========================================================

    function getElement(id) {

        return document.getElementById(id);

    }


    function getConfig() {

        return (
            window.FSI_CALCULATOR_CONFIG ||
            window.FSI_CONFIG ||
            {}
        );

    }


    function refreshIcons() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();

        }

    }


    // ========================================================
    // SET DEFAULT ELECTRICITY
    // ========================================================

    function setDefaultElectricity() {

        const config =
            getConfig();


        const electricityConfig =
            config.electricity || {};


        const tariffInput =
            getElement(
                "electricityTariff"
            );


        if (
            tariffInput &&
            !tariffInput.value
        ) {

            tariffInput.value =
                electricityConfig.defaultTariff ||
                1800;

        }

    }


    // ========================================================
    // LOAD DEFAULT ITEMS
    // ========================================================

    function loadDefaultItems() {

        if (
            window.FSIItems &&
            typeof window.FSIItems.loadDefaults ===
                "function"
        ) {

            window.FSIItems.loadDefaults();

            return true;

        }


        console.error(
            "FSI ERROR: FSIItems.loadDefaults() tidak tersedia."
        );


        return false;

    }


    // ========================================================
    // LOAD DEFAULT COSTS
    // ========================================================

    function loadDefaultCosts() {

        if (
            window.FSICosts &&
            typeof window.FSICosts.loadDefaults ===
                "function"
        ) {

            window.FSICosts.loadDefaults();

            return true;

        }


        console.error(
            "FSI ERROR: FSICosts.loadDefaults() tidak tersedia."
        );


        return false;

    }


    // ========================================================
    // ADD ITEM
    // ========================================================

    function addItem() {

        console.log(
            "FSI: Add Item button clicked."
        );


        if (
            !window.FSIItems
        ) {

            console.error(
                "FSI ERROR: window.FSIItems tidak ditemukan."
            );

            return;

        }


        if (
            typeof window.FSIItems.add !==
            "function"
        ) {

            console.error(
                "FSI ERROR: FSIItems.add() tidak tersedia."
            );

            return;

        }


        const newItem =
            window.FSIItems.add({

                name: "New Item",

                qty: 1,

                price: 0

            });


        /*
         * Refresh icon setelah row dibuat.
         */

        refreshIcons();


        /*
         * Focus otomatis ke nama item baru.
         */

        setTimeout(
            function () {

                focusLastRow(
                    ".item-name"
                );

            },
            50
        );


        return newItem;

    }


    // ========================================================
    // ADD COST
    // ========================================================

    function addCost() {

        console.log(
            "FSI: Add Cost button clicked."
        );


        if (
            !window.FSICosts
        ) {

            console.error(
                "FSI ERROR: window.FSICosts tidak ditemukan."
            );

            return;

        }


        if (
            typeof window.FSICosts.addManual !==
            "function"
        ) {

            console.error(
                "FSI ERROR: FSICosts.addManual() tidak tersedia."
            );

            return;

        }


        const newCost =
            window.FSICosts.addManual({

                name: "New Cost",

                qty: 1,

                price: 0

            });


        refreshIcons();


        setTimeout(
            function () {

                focusLastRow(
                    ".cost-name"
                );

            },
            50
        );


        return newCost;

    }


    // ========================================================
    // FOCUS LAST ROW
    // ========================================================

    function focusLastRow(selector) {

        const elements =
            document.querySelectorAll(
                selector
            );


        if (
            !elements.length
        ) {

            return;

        }


        const lastElement =
            elements[
                elements.length - 1
            ];


        if (
            !lastElement
        ) {

            return;

        }


        setTimeout(
            function () {

                lastElement.focus();


                if (
                    typeof lastElement.select ===
                    "function"
                ) {

                    lastElement.select();

                }

            },
            50
        );

    }


    // ========================================================
    // RESET INPUT
    // ========================================================

    function resetInputs() {

        const projectName =
            getElement(
                "projectName"
            );


        const customerName =
            getElement(
                "customerName"
            );


        const electricityBill =
            getElement(
                "electricityBill"
            );


        const electricityTariff =
            getElement(
                "electricityTariff"
            );


        const marginPercentage =
            getElement(
                "marginPercentage"
            );


        if (
            projectName
        ) {

            projectName.value =
                "";

        }


        if (
            customerName
        ) {

            customerName.value =
                "";

        }


        if (
            electricityBill
        ) {

            electricityBill.value =
                "";

        }


        if (
            electricityTariff
        ) {

            const config =
                getConfig();


            electricityTariff.value =
                (
                    config.electricity &&
                    config.electricity.defaultTariff
                ) ||
                1800;

        }


        if (
            marginPercentage
        ) {

            marginPercentage.value =
                "";

        }

    }


    // ========================================================
    // RESET ITEMS
    // ========================================================

    function resetItems() {

        if (
            window.FSIItems &&
            typeof window.FSIItems.clear ===
                "function"
        ) {

            window.FSIItems.clear();

        }

    }


    // ========================================================
    // RESET COSTS
    // ========================================================

    function resetCosts() {

        if (
            window.FSICosts &&
            typeof window.FSICosts.clear ===
                "function"
        ) {

            window.FSICosts.clear();

        }

    }


    // ========================================================
    // RESET QUOTATION
    // ========================================================

    function resetQuotation() {

        if (
            window.FSIQuotation &&
            typeof window.FSIQuotation.clear ===
                "function"
        ) {

            window.FSIQuotation.clear();

        }

    }


    // ========================================================
    // RESET CALCULATOR
    // ========================================================

    function resetCalculator() {

        const confirmed =
            window.confirm(
                "Reset semua data calculator?"
            );


        if (
            !confirmed
        ) {

            return;

        }


        resetQuotation();


        resetItems();


        resetCosts();


        resetInputs();


        /*
         * Load kembali default data.
         */

        loadDefaultItems();


        loadDefaultCosts();


        /*
         * Update calculation.
         */

        if (
            window.FSICalculation &&
            typeof window.FSICalculation.calculate ===
                "function"
        ) {

            window.FSICalculation.calculate();

        }


        refreshIcons();


        /*
         * Scroll ke atas calculator.
         */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    // ========================================================
    // BUTTON EVENTS
    // ========================================================

    function bindButtons() {

        /*
         * Jangan bind dua kali.
         */

        if (
            window.FSI_MAIN_STATE.buttonsBound
        ) {

            return;

        }


        const addItemButton =
            getElement(
                "addItemBtn"
            );


        const addCostButton =
            getElement(
                "addCostBtn"
            );


        const resetButton =
            getElement(
                "resetCalculatorBtn"
            );


        // ====================================================
        // ADD ITEM BUTTON
        // ====================================================

        if (
            addItemButton
        ) {

            /*
             * Pastikan bukan submit button.
             */

            addItemButton.type =
                "button";


            addItemButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    addItem();

                }
            );


        } else {

            console.error(
                'FSI ERROR: Tombol "#addItemBtn" tidak ditemukan.'
            );

        }


        // ====================================================
        // ADD COST BUTTON
        // ====================================================

        if (
            addCostButton
        ) {

            addCostButton.type =
                "button";


            addCostButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    addCost();

                }
            );


        } else {

            console.error(
                'FSI ERROR: Tombol "#addCostBtn" tidak ditemukan.'
            );

        }


        // ====================================================
        // RESET BUTTON
        // ====================================================

        if (
            resetButton
        ) {

            resetButton.type =
                "button";


            resetButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    resetCalculator();

                }
            );

        }


        /*
         * Tandai sudah bind.
         */

        window.FSI_MAIN_STATE.buttonsBound =
            true;

    }


    // ========================================================
    // INPUT ENTER BEHAVIOR
    // ========================================================

    function bindEnterBehavior() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;

                }


                const target =
                    event.target;


                if (
                    !target ||
                    !target.matches(
                        ".item-name, .item-qty, .item-price, .cost-name, .cost-qty, .cost-price"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                const row =
                    target.closest(
                        "tr"
                    );


                if (
                    !row
                ) {

                    return;

                }


                const inputs =
                    Array.from(
                        row.querySelectorAll(
                            "input:not([readonly])"
                        )
                    );


                const currentIndex =
                    inputs.indexOf(
                        target
                    );


                if (
                    currentIndex >= 0 &&
                    currentIndex <
                        inputs.length - 1
                ) {

                    const nextInput =
                        inputs[
                            currentIndex + 1
                        ];


                    nextInput.focus();


                    if (
                        typeof nextInput.select ===
                            "function"
                    ) {

                        nextInput.select();

                    }

                }

            }
        );

    }


    // ========================================================
    // AUTO RECALCULATE
    // ========================================================

    function bindAutoCalculation() {

        document.addEventListener(
            "fsi:items-changed",
            function () {

                if (
                    window.FSICalculation &&
                    typeof window.FSICalculation.calculate ===
                        "function"
                ) {

                    window.FSICalculation.calculate();

                }

            }
        );


        document.addEventListener(
            "fsi:costs-changed",
            function () {

                if (
                    window.FSICalculation &&
                    typeof window.FSICalculation.calculate ===
                        "function"
                ) {

                    window.FSICalculation.calculate();

                }

            }
        );

    }


    // ========================================================
    // INITIALIZE CALCULATION
    // ========================================================

    function initializeCalculation() {

        if (
            window.FSICalculation &&
            typeof window.FSICalculation.initialize ===
                "function"
        ) {

            window.FSICalculation.initialize();

        } else {

            console.warn(
                "FSI WARNING: FSICalculation belum tersedia."
            );

        }

    }


    // ========================================================
    // INITIALIZE QUOTATION
    // ========================================================

    function initializeQuotation() {

        if (
            window.FSIQuotation &&
            typeof window.FSIQuotation.hide ===
                "function"
        ) {

            window.FSIQuotation.hide();

        }

    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    function initialize() {

        /*
         * Jangan initialize dua kali.
         */

        if (
            window.FSI_MAIN_STATE.initialized
        ) {

            return;

        }


        /*
         * Tandai initialized.
         */

        window.FSI_MAIN_STATE.initialized =
            true;


        console.log(
            "FSI Calculator: Initializing..."
        );


        // ----------------------------------------------------
        // DEFAULT ELECTRICITY
        // ----------------------------------------------------

        setDefaultElectricity();


        // ----------------------------------------------------
        // DEFAULT ITEMS
        // ----------------------------------------------------

        loadDefaultItems();


        // ----------------------------------------------------
        // DEFAULT COSTS
        // ----------------------------------------------------

        loadDefaultCosts();


        // ----------------------------------------------------
        // BUTTONS
        // ----------------------------------------------------

        bindButtons();


        // ----------------------------------------------------
        // ENTER BEHAVIOR
        // ----------------------------------------------------

        bindEnterBehavior();


        // ----------------------------------------------------
        // AUTO CALCULATION
        // ----------------------------------------------------

        bindAutoCalculation();


        // ----------------------------------------------------
        // CALCULATION
        // ----------------------------------------------------

        initializeCalculation();


        // ----------------------------------------------------
        // QUOTATION
        // ----------------------------------------------------

        initializeQuotation();


        // ----------------------------------------------------
        // LUCIDE
        // ----------------------------------------------------

        refreshIcons();


        // ----------------------------------------------------
        // APPLICATION READY
        // ----------------------------------------------------

        document.dispatchEvent(
            new CustomEvent(
                "fsi:calculator-ready"
            )
        );


        console.log(
            "FSI Calculator: Ready."
        );

    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    window.FSIMain = {

        initialize:
            initialize,

        addItem:
            addItem,

        addCost:
            addCost,

        reset:
            resetCalculator,

        refreshIcons:
            refreshIcons

    };


    // ========================================================
    // DOM READY
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})();
```
