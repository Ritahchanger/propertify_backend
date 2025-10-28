const swaggerJsdoc = require("swagger-jsdoc");

const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 5000;

const options = {

    definition:{

        openapi: "3.0.0",

        info:{

        title:"Real Estate API",

        version:"1.0.0",

        description:"API documentation for the Real Estate Management system"

        },

        servers:[
            {
                url:`http://localhost:${PORT}/api`,
            }
        ]

    },

    apis:["./src/routes/*.js"]
}

const swaggerSpec = swaggerJsdoc(options);


module.exports = {swaggerUi, swaggerSpec};