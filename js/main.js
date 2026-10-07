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
//
// ============================================================

(function () {
    "use strict";

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    window.FSI_MAIN_STATE =
        window.FSI_MAIN_STATE || {
            initialized: false
        };

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------

    function getElement(id) {
        return document.getElementById(id);
    }

    function getConfig() {
        return window.FSI_CALCULATOR_CONFIG || {};
    }

    function refreshIcons() {
        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {
            window.lucide.createIcons();
        }
    }

    // --------------------------------------------------------
    // SET DEFAULT ELECTRICITY
    // --------------------------------------------------------

    function setDefaultElectricity() {
        const config = getConfig();

        const electricityConfig =
            config.electricity || {};

        const tariffInput =
            getElement("electricityTariff");

        if (
            tariffInput &&
            !tariffInput.value
        ) {
            tariffInput.value =
                electricityConfig.defaultTariff || 1800;
        }
    }

    // --------------------------------------------------------
    // LOAD DEFAULT ITEMS
    // --------------------------------------------------------

    function loadDefaultItems() {
        if (
            window.FSIItems &&
            typeof window.FSIItems.loadDefaults === "function"
        ) {
            window.FSIItems.loadDefaults();
        }
    }

    // --------------------------------------------------------
    // LOAD DEFAULT COSTS
    // --------------------------------------------------------

    function loadDefaultCosts() {
        if (
            window.FSICosts &&
            typeof window.FSICosts.loadDefaults === "function"
        ) {
            window.FSICosts.loadDefaults();
        }
    }

    // --------------------------------------------------------
    // ADD ITEM
    // --------------------------------------------------------

    function addItem() {
        if (
            !window.FSIItems ||
            typeof window.FSIItems.add !== "function"
        ) {
            return;
        }

        window.FSIItems.add({
            name: "New Item",
            qty: 1,
            price: 0
        });

        refreshIcons();

        // Focus ke nama item baru
        focusLastRow(".item-name");
    }

    // --------------------------------------------------------
    // ADD COST
    // --------------------------------------------------------

    function addCost() {
        if (
            !window.FSICosts ||
            typeof window.FSICosts.addManual !== "function"
        ) {
            return;
        }

        window.FSICosts.addManual({
            name: "New Cost",
            qty: 1,
            price: 0
        });

        refreshIcons();

        // Focus ke nama biaya baru
        focusLastRow(".cost-name");
    }

    // --------------------------------------------------------
    // FOCUS LAST ROW
    // --------------------------------------------------------

    function focusLastRow(selector) {
        const elements =
            document.querySelectorAll(selector);

        if (!elements.length) {
            return;
        }

        const lastElement =
            elements[elements.length - 1];

        setTimeout(function () {

            lastElement.focus();

            if (
                typeof lastElement.select === "function"
            ) {
                lastElement.select();
            }

        }, 50);
    }

    // --------------------------------------------------------
    // RESET INPUT
    // --------------------------------------------------------

    function resetInputs() {
        const projectName =
            getElement("projectName");

        const customerName =
            getElement("customerName");

        const electricityBill =
            getElement("electricityBill");

        const electricityTariff =
            getElement("electricityTariff");

        const marginPercentage =
            getElement("marginPercentage");

        if (projectName) {
            projectName.value = "";
        }

        if (customerName) {
            customerName.value = "";
        }

        if (electricityBill) {
            electricityBill.value = "";
        }

        if (electricityTariff) {
            const config = getConfig();

            electricityTariff.value =
                config.electricity?.defaultTariff || 1800;
        }

        if (marginPercentage) {
            marginPercentage.value = "";
        }
    }

    // --------------------------------------------------------
    // RESET ITEMS
    // --------------------------------------------------------

    function resetItems() {
        if (
            window.FSIItems &&
            typeof window.FSIItems.clear === "function"
        ) {
            window.FSIItems.clear();
        }
    }

    // --------------------------------------------------------
    // RESET COSTS
    // --------------------------------------------------------

    function resetCosts() {
        if (
            window.FSICosts &&
            typeof window.FSICosts.clear === "function"
        ) {
            window.FSICosts.clear();
        }
    }

    // --------------------------------------------------------
    // RESET QUOTATION
    // --------------------------------------------------------

    function resetQuotation() {
        if (
            window.FSIQuotation &&
            typeof window.FSIQuotation.clear === "function"
        ) {
            window.FSIQuotation.clear();
        }
    }

    // --------------------------------------------------------
    // RESET CALCULATOR
    // --------------------------------------------------------

    function resetCalculator() {

        const confirmed =
            window.confirm(
                "Reset semua data calculator?"
            );

        if (!confirmed) {
            return;
        }

        resetQuotation();

        resetItems();

        resetCosts();

        resetInputs();

        // Load kembali default data
        loadDefaultItems();
        loadDefaultCosts();

        // Update calculation
        if (
            window.FSICalculation &&
            typeof window.FSICalculation.calculate === "function"
        ) {
            window.FSICalculation.calculate();
        }

        refreshIcons();

        // Scroll ke atas calculator
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // --------------------------------------------------------
    // BUTTON EVENTS
    // --------------------------------------------------------

    function bindButtons() {

        const addItemButton =
            getElement("addItemBtn");

        const addCostButton =
            getElement("addCostBtn");

        const resetButton =
            getElement("resetCalculatorBtn");

        if (addItemButton) {

            addItemButton.addEventListener(
                "click",
                function () {
                    addItem();
                }
            );

        }

        if (addCostButton) {

            addCostButton.addEventListener(
                "click",
                function () {
                    addCost();
                }
            );

        }

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                function () {
                    resetCalculator();
                }
            );

        }
    }

    // --------------------------------------------------------
    // INPUT ENTER BEHAVIOR
    // --------------------------------------------------------

    function bindEnterBehavior() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Enter"
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
                    target.closest("tr");

                if (!row) {
                    return;
                }

                const inputs =
                    Array.from(
                        row.querySelectorAll(
                            "input:not([readonly])"
                        )
                    );

                const currentIndex =
                    inputs.indexOf(target);

                if (
                    currentIndex >= 0 &&
                    currentIndex < inputs.length - 1
                ) {
                    inputs[currentIndex + 1].focus();

                    if (
                        typeof inputs[currentIndex + 1].select === "function"
                    ) {
                        inputs[currentIndex + 1].select();
                    }
                }
            }
        );
    }

    // --------------------------------------------------------
    // AUTO RECALCULATE
    // --------------------------------------------------------

    function bindAutoCalculation() {

        document.addEventListener(
            "fsi:items-changed",
            function () {

                if (
                    window.FSICalculation &&
                    typeof window.FSICalculation.calculate === "function"
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
                    typeof window.FSICalculation.calculate === "function"
                ) {
                    window.FSICalculation.calculate();
                }

            }
        );
    }

    // --------------------------------------------------------
    // INITIALIZE CALCULATION
    // --------------------------------------------------------

    function initializeCalculation() {

        if (
            window.FSICalculation &&
            typeof window.FSICalculation.initialize === "function"
        ) {
            window.FSICalculation.initialize();
        }

    }

    // --------------------------------------------------------
    // INITIALIZE QUOTATION
    // --------------------------------------------------------

    function initializeQuotation() {

        if (
            window.FSIQuotation &&
            typeof window.FSIQuotation.hide === "function"
        ) {
            window.FSIQuotation.hide();
        }

    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    function initialize() {

        if (
            window.FSI_MAIN_STATE.initialized
        ) {
            return;
        }

        window.FSI_MAIN_STATE.initialized =
            true;

        setDefaultElectricity();

        loadDefaultItems();

        loadDefaultCosts();

        bindButtons();

        bindEnterBehavior();

        bindAutoCalculation();

        initializeCalculation();

        initializeQuotation();

        refreshIcons();

        // ----------------------------------------------------
        // Application ready event
        // ----------------------------------------------------

        document.dispatchEvent(
            new CustomEvent(
                "fsi:calculator-ready"
            )
        );

    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    window.FSIMain = {

        initialize,

        addItem,

        addCost,

        reset: resetCalculator,

        refreshIcons
    };

    // --------------------------------------------------------
    // DOM READY
    // --------------------------------------------------------

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );

    } else {

        initialize();

    }

})();
