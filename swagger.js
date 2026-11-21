import swaggerJsdoc from "swagger-jsdoc";

const swaggerSpec = swaggerJsdoc({
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Kizuna Rail API",
			version: "1.0.0",
		},
	},
	apis: ["./src/routes/api-routes.js"],
});

export default swaggerSpec;
