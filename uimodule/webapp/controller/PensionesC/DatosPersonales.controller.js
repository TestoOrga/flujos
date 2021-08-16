sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast) {
		"use strict";

		return Controller.extend("bafar.flujos.flujos.controller.PensionesC.DatosPersonales", {
			onInit: function () {

			},
			onButAction: function () {
				MessageToast.show("Datos Personales");
			}
		});
	});
