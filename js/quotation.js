// ============================================================
// FSI CALCULATOR - CUSTOMER QUOTATION MODULE
// ============================================================
//
// Fungsi utama:
// 1. Generate quotation customer
// 2. Tidak menampilkan harga item internal
// 3. Tidak menampilkan biaya internal
// 4. Tidak menampilkan margin
// 5. Menampilkan system / service + quantity
// 6. Menampilkan total investment
// 7. Menampilkan free site survey & consultation
// 8. Print / Save PDF
// 9. Edit quotation kembali ke calculator
//
// ============================================================

(function () {
    "use strict";

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    window.FSI_QUOTATION_STATE =
        window.FSI_QUOTATION_STATE || {
            generated: false,
            data: null
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

    function getCompany() {
        const config = getConfig();

        return config.company || {
            name: "FRENCH SOLAR INDUSTRY",
            brand: "FSI CONSULTANT",
            subtitle: "SOLAR ENERGY SOLUTIONS"
        };
    }

    function getQuotationConfig() {
        const config = getConfig();

        return config.quotation || {
            title: "CUSTOMER QUOTATION",
            subtitle: "SOLAR ENERGY SOLUTIONS",
            freeServices: [
                "FREE SITE SURVEY",
                "FREE CONSULTATION"
            ],
            notes: [
                "Final system configuration will be confirmed after site survey.",
                "Installation conditions may affect the final project scope.",
                "Quotation is subject to final technical assessment."
            ]
        };
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatCurrency(value) {
        if (
            window.FSICalculation &&
            typeof window.FSICalculation.formatCurrency === "function"
        ) {
            return window.FSICalculation.formatCurrency(value);
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function formatNumber(value, decimals = 2) {
        if (
            window.FSICalculation &&
            typeof window.FSICalculation.formatNumber === "function"
        ) {
            return window.FSICalculation.formatNumber(
                value,
                decimals
            );
        }

        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(Number(value) || 0);
    }

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    function getCurrentDate() {
        const now = new Date();

        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(now);
    }

    // --------------------------------------------------------
    // GET CALCULATION DATA
    // --------------------------------------------------------

    function getCalculationData() {
        if (
            window.FSICalculation &&
            typeof window.FSICalculation.getCalculationData === "function"
        ) {
            return window.FSICalculation.getCalculationData();
        }

        return {
            projectName:
                getElement("projectName")?.value?.trim() || "",

            customerName:
                getElement("customerName")?.value?.trim() || "",

            electricityBill:
                Number(getElement("electricityBill")?.value) || 0,

            electricityTariff:
                Number(getElement("electricityTariff")?.value) || 0,

            estimatedUsage: 0,
            estimatedDailyUsage: 0,

            grandTotal: 0
        };
    }

    // --------------------------------------------------------
    // GET ITEMS
    // --------------------------------------------------------

    function getItems() {
        if (
            window.FSIItems &&
            typeof window.FSIItems.getAll === "function"
        ) {
            return window.FSIItems.getAll();
        }

        return [];
    }

    // --------------------------------------------------------
    // BUILD QUOTATION DATA
    // --------------------------------------------------------

    function buildQuotationData() {
        const calculation =
            getCalculationData();

        const items =
            getItems();

        const quotationConfig =
            getQuotationConfig();

        const company =
            getCompany();

        return {
            company,

            projectName:
                calculation.projectName || "Solar Energy Project",

            customerName:
                calculation.customerName || "Customer",

            electricityBill:
                calculation.electricityBill || 0,

            electricityTariff:
                calculation.electricityTariff || 0,

            estimatedUsage:
                calculation.estimatedUsage || 0,

            estimatedDailyUsage:
                calculation.estimatedDailyUsage || 0,

            items: items.map(function (item) {
                return {
                    name: item.name || "Solar System",
                    qty: Number(item.qty) || 0
                };
            }),

            totalInvestment:
                calculation.grandTotal || 0,

            quotationTitle:
                quotationConfig.title ||
                "CUSTOMER QUOTATION",

            quotationSubtitle:
                quotationConfig.subtitle ||
                company.subtitle ||
                "SOLAR ENERGY SOLUTIONS",

            freeServices:
                quotationConfig.freeServices || [],

            notes:
                quotationConfig.notes || [],

            date:
                getCurrentDate()
        };
    }

    // --------------------------------------------------------
    // RENDER ITEM TABLE
    // --------------------------------------------------------

    function renderQuotationItems(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return `
                <tr>
                    <td colspan="2" class="quotation-empty">
                        Solar Energy System
                    </td>
                </tr>
            `;
        }

        return items.map(function (item) {
            return `
                <tr>
                    <td>
                        ${escapeHtml(item.name)}
                    </td>

                    <td class="quotation-qty">
                        ${formatNumber(item.qty, 0)}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --------------------------------------------------------
    // RENDER FREE SERVICES
    // --------------------------------------------------------

    function renderFreeServices(services) {
        if (
            !Array.isArray(services) ||
            services.length === 0
        ) {
            return "";
        }

        return services.map(function (service) {
            return `
                <div class="quotation-free-service">
                    <i data-lucide="check-circle"></i>
                    <span>${escapeHtml(service)}</span>
                </div>
            `;
        }).join("");
    }

    // --------------------------------------------------------
    // RENDER NOTES
    // --------------------------------------------------------

    function renderNotes(notes) {
        if (
            !Array.isArray(notes) ||
            notes.length === 0
        ) {
            return "";
        }

        return notes.map(function (note) {
            return `
                <li>${escapeHtml(note)}</li>
            `;
        }).join("");
    }

    // --------------------------------------------------------
    // GENERATE DOCUMENT
    // --------------------------------------------------------

    function generateQuotation() {
        const quotation =
            buildQuotationData();

        const quotationDocument =
            getElement("quotationDocument");

        const quotationSection =
            getElement("quotationSection");

        if (!quotationDocument) {
            console.warn(
                "FSI Quotation: #quotationDocument tidak ditemukan."
            );

            return quotation;
        }

        const company =
            quotation.company;

        quotationDocument.innerHTML = `
            <div class="quotation-header">

                <div class="quotation-brand">

                    <img
                        src="assets/logo-fsi.png"
                        alt="${escapeHtml(company.name)}"
                        class="quotation-logo"
                    >

                    <div class="quotation-brand-text">

                        <div class="quotation-company-name">
                            ${escapeHtml(company.name)}
                        </div>

                        <div class="quotation-consultant">
                            ${escapeHtml(company.brand)}
                        </div>

                        <div class="quotation-subtitle">
                            ${escapeHtml(company.subtitle)}
                        </div>

                    </div>

                </div>

                <div class="quotation-title-area">

                    <div class="quotation-title">
                        ${escapeHtml(quotation.quotationTitle)}
                    </div>

                    <div class="quotation-date">
                        ${escapeHtml(quotation.date)}
                    </div>

                </div>

            </div>


            <div class="quotation-project-info">

                <div class="quotation-info-card">

                    <div class="quotation-info-label">
                        PROJECT
                    </div>

                    <div class="quotation-info-value">
                        ${escapeHtml(quotation.projectName)}
                    </div>

                </div>


                <div class="quotation-info-card">

                    <div class="quotation-info-label">
                        CUSTOMER
                    </div>

                    <div class="quotation-info-value">
                        ${escapeHtml(quotation.customerName)}
                    </div>

                </div>

            </div>


            <div class="quotation-electricity">

                <div class="quotation-electricity-title">
                    ELECTRICITY PROFILE
                </div>

                <div class="quotation-electricity-grid">

                    <div class="quotation-electricity-item">

                        <span>
                            Monthly Electricity Bill
                        </span>

                        <strong>
                            ${formatCurrency(
                                quotation.electricityBill
                            )}
                        </strong>

                    </div>


                    <div class="quotation-electricity-item">

                        <span>
                            PLN Tariff
                        </span>

                        <strong>
                            ${formatCurrency(
                                quotation.electricityTariff
                            )} / kWh
                        </strong>

                    </div>


                    <div class="quotation-electricity-item">

                        <span>
                            Estimated Usage
                        </span>

                        <strong>
                            ${formatNumber(
                                quotation.estimatedUsage,
                                2
                            )} kWh / month
                        </strong>

                    </div>


                    <div class="quotation-electricity-item">

                        <span>
                            Estimated Daily Usage
                        </span>

                        <strong>
                            ${formatNumber(
                                quotation.estimatedDailyUsage,
                                2
                            )} kWh / day
                        </strong>

                    </div>

                </div>

            </div>


            <div class="quotation-system">

                <div class="quotation-section-heading">
                    SYSTEM / SERVICE
                </div>

                <table class="quotation-table">

                    <thead>
                        <tr>
                            <th>
                                System / Service
                            </th>

                            <th>
                                Quantity
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${renderQuotationItems(
                            quotation.items
                        )}
                    </tbody>

                </table>

            </div>


            <div class="quotation-investment">

                <div class="quotation-investment-label">
                    TOTAL INVESTMENT
                </div>

                <div class="quotation-investment-value">
                    ${formatCurrency(
                        quotation.totalInvestment
                    )}
                </div>

            </div>


            <div class="quotation-free-services">

                <div class="quotation-section-heading">
                    INCLUDED SERVICES
                </div>

                <div class="quotation-free-list">
                    ${renderFreeServices(
                        quotation.freeServices
                    )}
                </div>

            </div>


            <div class="quotation-notes">

                <div class="quotation-section-heading">
                    NOTES
                </div>

                <ul>
                    ${renderNotes(
                        quotation.notes
                    )}
                </ul>

            </div>


            <div class="quotation-signature">

                <div class="quotation-signature-box">

                    <div>
                        Prepared by
                    </div>

                    <strong>
                        FSI CONSULTANT
                    </strong>

                </div>


                <div class="quotation-signature-box">

                    <div>
                        Customer
                    </div>

                    <strong>
                        ${escapeHtml(
                            quotation.customerName
                        )}
                    </strong>

                </div>

            </div>


            <div class="quotation-footer">

                <div>
                    ${escapeHtml(company.name)}
                </div>

                <div>
                    ${escapeHtml(company.subtitle)}
                </div>

            </div>
        `;

        window.FSI_QUOTATION_STATE.generated = true;
        window.FSI_QUOTATION_STATE.data =
            quotation;

        // ----------------------------------------------------
        // Show quotation section
        // ----------------------------------------------------

        if (quotationSection) {
            quotationSection.classList.remove("hidden");

            quotationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        // ----------------------------------------------------
        // Lucide icons
        // ----------------------------------------------------

        refreshIcons();

        // ----------------------------------------------------
        // Event
        // ----------------------------------------------------

        document.dispatchEvent(
            new CustomEvent(
                "fsi:quotation-generated",
                {
                    detail: quotation
                }
            )
        );

        return quotation;
    }

    // --------------------------------------------------------
    // REFRESH ICONS
    // --------------------------------------------------------

    function refreshIcons() {
        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {
            window.lucide.createIcons();
        }
    }

    // --------------------------------------------------------
    // PRINT QUOTATION
    // --------------------------------------------------------

    function printQuotation() {
        if (
            !window.FSI_QUOTATION_STATE.generated
        ) {
            generateQuotation();
        }

        window.print();
    }

    // --------------------------------------------------------
    // EDIT QUOTATION
    // --------------------------------------------------------

    function editQuotation() {
        const calculatorSection =
            getElement("calculatorSection");

        if (calculatorSection) {
            calculatorSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // --------------------------------------------------------
    // HIDE QUOTATION
    // --------------------------------------------------------

    function hideQuotation() {
        const quotationSection =
            getElement("quotationSection");

        if (quotationSection) {
            quotationSection.classList.add("hidden");
        }
    }

    // --------------------------------------------------------
    // CLEAR QUOTATION
    // --------------------------------------------------------

    function clearQuotation() {
        const quotationDocument =
            getElement("quotationDocument");

        if (quotationDocument) {
            quotationDocument.innerHTML = "";
        }

        window.FSI_QUOTATION_STATE.generated =
            false;

        window.FSI_QUOTATION_STATE.data =
            null;

        hideQuotation();
    }

    // --------------------------------------------------------
    // BUTTON EVENTS
    // --------------------------------------------------------

    function bindEvents() {
        const generateButton =
            getElement("generateQuotationBtn");

        const printButton =
            getElement("printQuotationBtn");

        const editButton =
            getElement("editQuotationBtn");

        if (generateButton) {
            generateButton.addEventListener(
                "click",
                function () {
                    generateQuotation();
                }
            );
        }

        if (printButton) {
            printButton.addEventListener(
                "click",
                function () {
                    printQuotation();
                }
            );
        }

        if (editButton) {
            editButton.addEventListener(
                "click",
                function () {
                    editQuotation();
                }
            );
        }
    }

    // --------------------------------------------------------
    // CALCULATION UPDATE
    // --------------------------------------------------------

    function bindCalculationUpdate() {
        document.addEventListener(
            "fsi:calculation-updated",
            function () {

                // Jika quotation sudah pernah dibuat,
                // jangan langsung menimpa tampilan customer.
                // Data akan diperbarui ketika Generate Quotation
                // ditekan kembali.

            }
        );
    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------

    window.FSIQuotation = {

        generate:
            generateQuotation,

        print:
            printQuotation,

        edit:
            editQuotation,

        hide:
            hideQuotation,

        clear:
            clearQuotation,

        getData:
            function () {
                return window.FSI_QUOTATION_STATE.data;
            },

        buildData:
            buildQuotationData
    };

    // --------------------------------------------------------
    // PREVENT DUPLICATE INITIALIZATION
    // --------------------------------------------------------

    if (window.FSI_QUOTATION_INITIALIZED) {
        return;
    }

    window.FSI_QUOTATION_INITIALIZED = true;

    // --------------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------------

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                bindEvents();
                bindCalculationUpdate();
            },
            { once: true }
        );

    } else {

        bindEvents();
        bindCalculationUpdate();

    }

})();
