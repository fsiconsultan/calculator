// ============================================================
// FSI CALCULATOR - CALCULATION MODULE
// ============================================================
//
// Fungsi utama:
// 1. Menghitung estimasi pemakaian PLN
// 2. Menghitung total item
// 3. Menghitung total biaya
// 4. Menghitung subtotal
// 5. Menghitung margin / markup
// 6. Menghitung grand total
// 7. Update summary
// 8. Menyediakan data untuk quotation
//
// ============================================================

(function () {
    "use strict";

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    window.FSI_CALCULATION_STATE = window.FSI_CALCULATION_STATE || {
        electricityBill: 0,
        electricityTariff: 1800,
        estimatedUsage: 0,
        estimatedDailyUsage: 0,

        totalItems: 0,
        totalCosts: 0,
        subtotal: 0,

        marginPercentage: 0,
        marginAmount: 0,

        grandTotal: 0
    };

    // --------------------------------------------------------
    // CONFIG
    // --------------------------------------------------------

    function getConfig() {
        return window.FSI_CALCULATOR_CONFIG || {};
    }

    function getCurrencyConfig() {
        return window.FSI_CURRENCY || {
            locale: "id-ID",
            currency: "IDR",
            symbol: "Rp"
        };
    }

    // --------------------------------------------------------
    // NUMBER HELPERS
    // --------------------------------------------------------

    function toNumber(value, fallback = 0) {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }

        if (typeof value === "number") {
            return Number.isFinite(value) ? value : fallback;
        }

        const cleaned = String(value)
            .replace(/[^\d.-]/g, "");

        const number = Number(cleaned);

        return Number.isFinite(number) ? number : fallback;
    }

    // --------------------------------------------------------
    // CURRENCY FORMAT
    // --------------------------------------------------------

    function formatCurrency(value) {
        const currencyConfig = getCurrencyConfig();

        const number = Math.max(0, toNumber(value));

        return new Intl.NumberFormat(
            currencyConfig.locale || "id-ID",
            {
                style: "currency",
                currency: currencyConfig.currency || "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).format(number);
    }

    // --------------------------------------------------------
    // NUMBER FORMAT
    // --------------------------------------------------------

    function formatNumber(value, decimals = 2) {
        const number = toNumber(value);

        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    // --------------------------------------------------------
    // GET ELEMENT
    // --------------------------------------------------------

    function getElement(id) {
        return document.getElementById(id);
    }

    // --------------------------------------------------------
    // ELECTRICITY CALCULATION
    // --------------------------------------------------------

    function calculateElectricity() {
        const config = getConfig();

        const electricityConfig = config.electricity || {};

        const billInput = getElement("electricityBill");
        const tariffInput = getElement("electricityTariff");

        let bill = toNumber(
            billInput ? billInput.value : 0
        );

        let tariff = toNumber(
            tariffInput
                ? tariffInput.value
                : electricityConfig.defaultTariff || 1800
        );

        if (bill < 0) {
            bill = 0;
        }

        if (tariff < 0) {
            tariff = 0;
        }

        let estimatedUsage = 0;

        if (tariff > 0 && bill > 0) {
            estimatedUsage = bill / tariff;
        }

        const estimatedDailyUsage = estimatedUsage / 30;

        window.FSI_CALCULATION_STATE.electricityBill = bill;
        window.FSI_CALCULATION_STATE.electricityTariff = tariff;
        window.FSI_CALCULATION_STATE.estimatedUsage = estimatedUsage;
        window.FSI_CALCULATION_STATE.estimatedDailyUsage =
            estimatedDailyUsage;

        updateElectricityDisplay();

        return {
            bill,
            tariff,
            estimatedUsage,
            estimatedDailyUsage
        };
    }

    // --------------------------------------------------------
    // UPDATE ELECTRICITY DISPLAY
    // --------------------------------------------------------

    function updateElectricityDisplay() {
        const usageElement = getElement("estimatedUsage");
        const dailyElement = getElement("estimatedDailyUsage");

        const state = window.FSI_CALCULATION_STATE;

        if (usageElement) {
            usageElement.textContent =
                `${formatNumber(state.estimatedUsage, 2)} kWh / bulan`;
        }

        if (dailyElement) {
            dailyElement.textContent =
                `${formatNumber(state.estimatedDailyUsage, 2)} kWh / hari`;
        }
    }

    // --------------------------------------------------------
    // GET MARGIN
    // --------------------------------------------------------

    function getMarginPercentage() {
        const marginInput = getElement("marginPercentage");

        if (!marginInput) {
            return 0;
        }

        const value = marginInput.value;

        // Blank = 0%
        if (value === null || value === undefined || value === "") {
            return 0;
        }

        const margin = toNumber(value);

        return Math.max(0, margin);
    }

    // --------------------------------------------------------
    // CALCULATE ITEMS
    // --------------------------------------------------------

    function calculateItems() {
        if (
            window.FSIItems &&
            typeof window.FSIItems.getTotal === "function"
        ) {
            return Math.max(
                0,
                toNumber(window.FSIItems.getTotal())
            );
        }

        return 0;
    }

    // --------------------------------------------------------
    // CALCULATE COSTS
    // --------------------------------------------------------

    function calculateCosts() {
        if (
            window.FSICosts &&
            typeof window.FSICosts.getTotal === "function"
        ) {
            return Math.max(
                0,
                toNumber(window.FSICosts.getTotal())
            );
        }

        return 0;
    }

    // --------------------------------------------------------
    // MAIN CALCULATION
    // --------------------------------------------------------

    function calculate() {
        const electricity = calculateElectricity();

        const totalItems = calculateItems();
        const totalCosts = calculateCosts();

        const subtotal = totalItems + totalCosts;

        const marginPercentage = getMarginPercentage();

        const marginAmount =
            subtotal * (marginPercentage / 100);

        const grandTotal =
            subtotal + marginAmount;

        const state = window.FSI_CALCULATION_STATE;

        state.totalItems = totalItems;
        state.totalCosts = totalCosts;
        state.subtotal = subtotal;

        state.marginPercentage = marginPercentage;
        state.marginAmount = marginAmount;

        state.grandTotal = grandTotal;

        updateSummary();

        dispatchCalculationEvent();

        return getSummary();
    }

    // --------------------------------------------------------
    // UPDATE SUMMARY
    // --------------------------------------------------------

    function updateSummary() {
        const state = window.FSI_CALCULATION_STATE;

        const totalItemsElement =
            getElement("totalItems");

        const totalCostsElement =
            getElement("totalCosts");

        const summaryTotalItemsElement =
            getElement("summaryTotalItems");

        const summaryTotalCostsElement =
            getElement("summaryTotalCosts");

        const summarySubtotalElement =
            getElement("summarySubtotal");

        const summaryMarginElement =
            getElement("summaryMargin");

        const grandTotalElement =
            getElement("grandTotal");

        // ----------------------------------------------------
        // Main totals
        // ----------------------------------------------------

        if (totalItemsElement) {
            totalItemsElement.textContent =
                formatCurrency(state.totalItems);
        }

        if (totalCostsElement) {
            totalCostsElement.textContent =
                formatCurrency(state.totalCosts);
        }

        // ----------------------------------------------------
        // Summary
        // ----------------------------------------------------

        if (summaryTotalItemsElement) {
            summaryTotalItemsElement.textContent =
                formatCurrency(state.totalItems);
        }

        if (summaryTotalCostsElement) {
            summaryTotalCostsElement.textContent =
                formatCurrency(state.totalCosts);
        }

        if (summarySubtotalElement) {
            summarySubtotalElement.textContent =
                formatCurrency(state.subtotal);
        }

        if (summaryMarginElement) {
            summaryMarginElement.textContent =
                formatCurrency(state.marginAmount);
        }

        if (grandTotalElement) {
            grandTotalElement.textContent =
                formatCurrency(state.grandTotal);
        }
    }

    // --------------------------------------------------------
    // SUMMARY DATA
    // --------------------------------------------------------

    function getSummary() {
        const state = window.FSI_CALCULATION_STATE;

        return {
            electricityBill: state.electricityBill,
            electricityTariff: state.electricityTariff,

            estimatedUsage: state.estimatedUsage,
            estimatedDailyUsage: state.estimatedDailyUsage,

            totalItems: state.totalItems,
            totalCosts: state.totalCosts,

            subtotal: state.subtotal,

            marginPercentage: state.marginPercentage,
            marginAmount: state.marginAmount,

            grandTotal: state.grandTotal
        };
    }

    // --------------------------------------------------------
    // PROJECT DATA
    // --------------------------------------------------------

    function getProjectData() {
        const projectElement =
            getElement("projectName");

        const customerElement =
            getElement("customerName");

        return {
            projectName: projectElement
                ? projectElement.value.trim()
                : "",

            customerName: customerElement
                ? customerElement.value.trim()
                : ""
        };
    }

    // --------------------------------------------------------
    // COMPLETE CALCULATION DATA
    // --------------------------------------------------------

    function getCalculationData() {
        const project = getProjectData();
        const summary = getSummary();

        return {
            ...project,
            ...summary
        };
    }

    // --------------------------------------------------------
    // EVENT
    // --------------------------------------------------------

    function dispatchCalculationEvent() {
        const data = getCalculationData();

        document.dispatchEvent(
            new CustomEvent(
                "fsi:calculation-updated",
                {
                    detail: data
                }
            )
        );
    }

    // --------------------------------------------------------
    // INPUT EVENTS
    // --------------------------------------------------------

    function bindInputEvents() {
        const electricityBill =
            getElement("electricityBill");

        const electricityTariff =
            getElement("electricityTariff");

        const marginPercentage =
            getElement("marginPercentage");

        const projectName =
            getElement("projectName");

        const customerName =
            getElement("customerName");

        if (electricityBill) {
            electricityBill.addEventListener(
                "input",
                calculate
            );

            electricityBill.addEventListener(
                "change",
                calculate
            );
        }

        if (electricityTariff) {
            electricityTariff.addEventListener(
                "input",
                calculate
            );

            electricityTariff.addEventListener(
                "change",
                calculate
            );
        }

        if (marginPercentage) {
            marginPercentage.addEventListener(
                "input",
                calculate
            );

            marginPercentage.addEventListener(
                "change",
                calculate
            );
        }

        // Project/customer tidak mengubah angka,
        // tetapi quotation perlu mendapatkan data terbaru.
        if (projectName) {
            projectName.addEventListener(
                "input",
                function () {
                    dispatchCalculationEvent();
                }
            );
        }

        if (customerName) {
            customerName.addEventListener(
                "input",
                function () {
                    dispatchCalculationEvent();
                }
            );
        }
    }

    // --------------------------------------------------------
    // ITEM / COST EVENTS
    // --------------------------------------------------------

    function bindCalculationEvents() {
        document.addEventListener(
            "fsi:items-changed",
            function () {
                calculate();
            }
        );

        document.addEventListener(
            "fsi:costs-changed",
            function () {
                calculate();
            }
        );
    }

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    function initialize() {
        calculate();
    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    window.FSICalculation = {
        calculate,
        calculateElectricity,
        updateElectricityDisplay,
        updateSummary,

        getMarginPercentage,

        getSummary,
        getProjectData,
        getCalculationData,

        formatCurrency,
        formatNumber,

        initialize
    };

    // --------------------------------------------------------
    // PREVENT DUPLICATE INITIALIZATION
    // --------------------------------------------------------

    if (window.FSI_CALCULATION_INITIALIZED) {
        return;
    }

    window.FSI_CALCULATION_INITIALIZED = true;

    // --------------------------------------------------------
    // DOM READY
    // --------------------------------------------------------

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                bindInputEvents();
                bindCalculationEvents();
                initialize();
            },
            { once: true }
        );
    } else {
        bindInputEvents();
        bindCalculationEvents();
        initialize();
    }

})();
