/* ============================================================
   FSI CONSULTANT - PLTS CALCULATOR
   File: js/config.js

   Fungsi:
   1. Default PLN tariff
   2. Default product prices
   3. Installation formula
   4. Aluminium structure formula
   5. Default calculator items
   6. Default calculator costs
   ============================================================ */


/* ============================================================
   1. GLOBAL CONFIGURATION
   ============================================================ */

window.FSI_CALCULATOR_CONFIG = {

    /* --------------------------------------------------------
       GENERAL
    -------------------------------------------------------- */

    company: {
        name: "FRENCH SOLAR INDUSTRY",
        brand: "FSI CONSULTANT",
        subtitle: "SOLAR ENERGY SOLUTIONS"
    },


    /* --------------------------------------------------------
       ELECTRICITY
    -------------------------------------------------------- */

    electricity: {

        /*
         * Default PLN tariff
         *
         * Rp 1.800 / kWh
         */
        defaultTariff: 1800

    },


    /* --------------------------------------------------------
       SOLAR PANEL
    -------------------------------------------------------- */

    solarPanel: {

        /*
         * Standard panel used by FSI calculator
         */
        watt: 650,

        /*
         * Default panel price
         */
        price: 2700000

    },


    /* --------------------------------------------------------
       HYBRID INVERTER
    -------------------------------------------------------- */

    hybridInverter: {

        name: "Hybrid Inverter 6.8 kW",

        power: "6.8 kW",

        price: 22400000

    },


    /* --------------------------------------------------------
       BATTERY
    -------------------------------------------------------- */

    battery: {

        name: "Lithium Battery 15 kWh",

        capacity: "15 kWh",

        price: 41400000

    },


    /* --------------------------------------------------------
       INSTALLATION
    -------------------------------------------------------- */

    installation: {

        name: "Installation",

        /*
         * Formula:
         *
         * Jumlah Panel × 520 × 1800
         *
         * 1 panel:
         * 520 × 1800 = Rp 936.000
         */

        coefficient: 520,

        tariff: 1800,

        auto: true

    },


    /* --------------------------------------------------------
       ALUMINIUM STRUCTURE
    -------------------------------------------------------- */

    aluminium: {

        name: "Aluminium Structure",

        /*
         * Formula:
         *
         * Jumlah Panel × 520 × 1800
         *
         * 1 panel:
         * 520 × 1800 = Rp 936.000
         */

        coefficient: 520,

        tariff: 1800,

        auto: true

    },


    /* --------------------------------------------------------
       DEFAULT ITEMS
    -------------------------------------------------------- */

    defaultItems: [

        {
            name: "Solar Panel 650 Wp",
            qty: 20,
            price: 2700000
        },

        {
            name: "Hybrid Inverter 6.8 kW",
            qty: 1,
            price: 22400000
        },

        {
            name: "Lithium Battery 15 kWh",
            qty: 1,
            price: 41400000
        }

    ],


    /* --------------------------------------------------------
       DEFAULT PROJECT COSTS
    -------------------------------------------------------- */

    defaultCosts: [

        {
            name: "Installation",

            /*
             * Automatically follows
             * total number of solar panels.
             */
            qty: 20,

            price: 936000,

            auto: true,

            /*
             * Used by costs.js to identify
             * the automatic calculation formula.
             */
            formula: "installation"
        },

        {
            name: "Aluminium Structure",

            /*
             * Automatically follows
             * total number of solar panels.
             */
            qty: 20,

            price: 936000,

            auto: true,

            /*
             * Used by costs.js to identify
             * the automatic calculation formula.
             */
            formula: "aluminium"
        }

    ],


    /* --------------------------------------------------------
       CUSTOMER QUOTATION
    -------------------------------------------------------- */

    quotation: {

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

    }

};


/* ============================================================
   2. HELPER
   ============================================================ */

/**
 * Get calculator configuration.
 *
 * Example:
 *
 * FSI_CONFIG.electricity.defaultTariff
 *
 */

window.FSI_CONFIG = window.FSI_CALCULATOR_CONFIG;


/* ============================================================
   3. DEFAULT CURRENCY
   ============================================================ */

window.FSI_CURRENCY = {

    locale: "id-ID",

    currency: "IDR",

    symbol: "Rp"

};


/* ============================================================
   4. DEFAULT SETTINGS
   ============================================================ */

window.FSI_CALCULATOR_SETTINGS = {

    /*
     * Blank margin means 0%.
     */
    defaultMargin: "",

    /*
     * Minimum quantity
     */
    minQuantity: 1,

    /*
     * Minimum price
     */
    minPrice: 0,

    /*
     * Number of decimals for percentage
     */
    marginDecimals: 2

};
