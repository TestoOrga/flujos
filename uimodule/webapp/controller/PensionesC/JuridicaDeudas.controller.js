sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, JSONModel, XMLView) {
    "use strict";
    var oModel,
      oODataJSONModel,
      sServiceUrl,
      oDataResults,
      oEntityUnidadIntervalo;

    return Controller.extend("namespace.name.project3.controller.View1", {
      onInit: function () {
        // Step 1

        oDataResults = [];
        oODataJSONModel = new sap.ui.model.json.JSONModel();
        sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
        oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

        // Step 2

        var oEntityClaveBanco = {
          P1: "CAT",
          P2: "BANKL",
          to_pesal: [],
        };

        /*var oEntity = {
					ClaveBanco : { P1 : "CAT", P2 : "BANKL"},
					ViaPago : { P1 : "CAT", P2 : "VIA"}
				};*/

        var oEntityViaPago = {
          P1: "CAT",
          P2: "VIA",
          to_pesal: [],
        };

        var oEntityTipoDescuento = {
          P1: "CAT",
          P2: "DEUDA",
          to_pesal: [],
        };

        oEntityUnidadIntervalo = {
          P1: "CAT",
          P2: "TIPOD",
          P3: "",
          to_pesal: [],
        };

        // Step 3

        /*Model.create("/BaseSet", oEntityViaPago, {

					success: function (oData, oResponse) {
						sap.m.MessageToast.show(" Creation success");
						oODataJSONModel.setData({
							viaPago: oData.to_pesal.results
						});
						
						//window.console.log(oDataResults)
					},

					error: function (oError) {
						// Error
						sap.m.MessageToast.show(" Creation failed");
					}
				});*/

        var that = this;
        oModel.create("/BaseSet", oEntityClaveBanco, {
          success: function (oData, oResponse) {
            // Success
            sap.m.MessageToast.show(" Created Successfully");
            window.console.log(oData.to_pesal.results);
            var data = oODataJSONModel.getData();
            data.claveBanco = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            sap.m.MessageToast.show(" Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityViaPago, {
          success: function (oData, oResponse) {
            // Success
            sap.m.MessageToast.show(" Created Successfully");
            //window.console.log(oData.to_pesal);
            var data = oODataJSONModel.getData();
            data.viaPago = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            sap.m.MessageToast.show(" Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityTipoDescuento, {
          success: function (oData, oResponse) {
            // Success
            sap.m.MessageToast.show(" Created Successfully");
            //window.console.log(oData.to_pesal);
            var data = oODataJSONModel.getData();
            data.tipoDescuento = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            sap.m.MessageToast.show(" Creation failed");
          },
        });

        this.getView().setModel(oODataJSONModel);
        window.console.log(oODataJSONModel);
      },
      onButAction: function (oEvent, param) {
        MessageToast.show(param);
      },
      onSelectDescuento: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var oSelectUnidadIntervalo = this.getView().byId("_unidadIntervalo");
        if (selectedItem) {
          var descuentoKey = selectedItem.getKey();
          var descuentoText = selectedItem.getText();
          this.getView().byId("_tipoDescuentoInput").setValue(descuentoKey);
          oEntityUnidadIntervalo.P3 = descuentoText;
          this.getView().byId("_unidadIntervalo").setEnabled(true);
          this.getView()
            .byId("_unidadIntervaloLabel")
            .setText("Unidad Intervalo");
        } else {
          this.getView().byId("_unidadIntervalo").setEnabled(false);
        }

        oModel.create("/BaseSet", oEntityUnidadIntervalo, {
          success: function (oData, oResponse) {
            // Success
            sap.m.MessageToast.show(" Created Successfully");
            //window.console.log(oData.to_pesal);
            var data = oODataJSONModel.getData();
            data.unidadIntervalo = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            sap.m.MessageToast.show(" Creation failed");
          },
        });
        oSelectUnidadIntervalo.setModel(oODataJSONModel);
      },
      onSelectClaveBanco: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var claveBancoKey = selectedItem.getKey();
        this.getView().byId("_claveBancoInput").setValue(claveBancoKey);
      },
      onSelectViaPago: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var viaPagoKey = selectedItem.getKey();
        this.getView().byId("_viaPagoInput").setValue(viaPagoKey);
      },
      onSelectUnidadIntervalo: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var unidadIntervaloKey = selectedItem.getKey();
        this.getView()
          .byId("_unidadIntervaloInput")
          .setValue(unidadIntervaloKey);
      },
    });
  }
);