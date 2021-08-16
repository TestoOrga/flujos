sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast) {
		"use strict";

		return Controller.extend("namespace.name.project3.controller.View1", {
			onInit: function () {
			},
			onButAction: function () {
				MessageToast.show("Juridica y Deudas");
			}
		});
	});
