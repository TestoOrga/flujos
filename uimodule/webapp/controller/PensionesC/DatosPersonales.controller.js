/* eslint-disable no-console */
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast) {
    "use strict";

    var noPersonalIn;

    return Controller.extend(
      "bafar.flujos.flujos.controller.PensionesC.DatosPersonales", {
        onInit: function () {
          window.console.log("Se inicia onInit");
          // Test
          /*
        var oData = {
        	"SelectedProduct": "HT-1001",
        	"SelectedProduct2": "HT-1001",
        	"SelectedProduct3": "HT-1001",
        	"ProductCollection": [
        		{
        			"ProductId": "HT-1000",
        			"Name": "Notebook Basic 15"
        		},
        		{
        			"ProductId": "HT-1001",
        			"Name": "Notebook Basic 17"
        		},
        		{
        			"ProductId": "HT-1002",
        			"Name": "Notebook Basic 18"
        		},
        		{
        			"ProductId": "HT-1003",
        			"Name": "Notebook Basic 19"
        		},
        		{
        			"ProductId": "HT-1007",
        			"Name": "ITelO Vault"
        		}
        	],
        	"ProductCollection2": [
        		{
        			"ProductId": "HT-1000",
        			"Name": "Notebook Basic 15"
        		},
        		{
        			"ProductId": "HT-1001",
        			"Name": "Notebook Basic 17"
        		},
        		{
        			"ProductId": "HT-1002",
        			"Name": "Notebook Basic 18"
        		},
        		{
        			"ProductId": "HT-1003",
        			"Name": "Notebook Basic 19"
        		},
        		{
        			"ProductId": "HT-1007",
        			"Name": "ITelO Vault"
        		}
        	],
        	"ProductCollection3": [
        		{
        			"ProductId": "HT-1000",
        			"Name": "Notebook Basic 15"
        		},
        		{
        			"ProductId": "HT-1001",
        			"Name": "Notebook Basic 17"
        		},
        		{
        			"ProductId": "HT-1002",
        			"Name": "Notebook Basic 18"
        		},
        		{
        			"ProductId": "HT-1003",
        			"Name": "Notebook Basic 19"
        		},
        		{
        			"ProductId": "HT-1007",
        			"Name": "ITelO Vault"
        		}
        	],
        	"Editable": true,
        	"Enabled": true
        };
        
        var jsonTestModel = new sap.ui.model.json.JSONModel();
        jsonTestModel.setData(oData);
        this.getView().setModel(jsonTestModel);
        window.console.log(jsonTestModel);
        */
          /*
				// Step 1
				
				var oDataResults = [];
				var oODataJSONModel = new sap.ui.model.json.JSONModel();
				var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
				
				// Step 2

				var oEntityData = {
					P1: "CAT",
					P2: "PERNR",
					P3: "00000001",

					to_pesal: []
				};

				// Step 3

				oModel.create("/BaseSet", oEntityData, {
					
					success : function(oData, oResponse) {
						 // Success
						 sap.m.MessageToast.show(" Created Successfully" );
						 //window.console.log(oData.to_pesal.results);
						 oODataJSONModel.setData({
							catalogo: oData.to_pesal.results
						});
						oDataResults = oData.to_pesal.results;
					},

					error : function(oError) {
						 // Error
					   sap.m.MessageToast.show(" Creation failed" );
					}
			  	});

				this.getView().setModel(oODataJSONModel);
				window.console.log(oODataJSONModel);
				window.console.log(oDataResults);
				*/
        },

        onEnterInputNoPersonal: function (oEvent) {
          noPersonalIn = this.getView().byId("noPeronsal_Input").getValue();
          noPersonalIn.toString();
          //window.console.log(noPersonalIn);

          // Step 1

          var oDataResults = [];
          var oODataJSONModel = new sap.ui.model.json.JSONModel();
          var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
          var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

          // Step 2

          var oEntityData = {
            P1: "CAT",
            P2: "PERNR",
            P3: noPersonalIn,

            to_pesal: [],
          };

          // Step 3

          oModel.create("/BaseSet", oEntityData, {
            success: function (oData, oResponse) {
              // Success
              sap.m.MessageToast.show(" Created Successfully");
              //window.console.log(oData.to_pesal.results);
              oODataJSONModel.setData({
                catalogo: oData.to_pesal.results,
              });
              oDataResults = oData.to_pesal.results;
            },

            error: function (oError) {
              // Error
              sap.m.MessageToast.show(" Creation failed");
            },
          });

          this.getView().setModel(oODataJSONModel);
          window.console.log(oODataJSONModel);
          window.console.log(oDataResults);

          // Setear valores a inputs
          this.getView().byId("noPeronsal_Input1").setValue(oDataResults[0].C2);
          this.getView().byId("sociedad_Input").setValue(oDataResults[0].C3);
          this.getView().byId("sociedad_Input1").setValue(oDataResults[0].C16);
          this.getView().byId("division_Input").setValue(oDataResults[0].C5);
          this.getView().byId("division_Input1").setValue(oDataResults[0].C17);
          this.getView().byId("funcion_Input").setValue(oDataResults[0].C10);
          this.getView().byId("funcion_Input1").setValue(oDataResults[0].C14);
          this.getView().byId("areaNomina_Input").setValue(oDataResults[0].C12);
        },
        test: function () {
          console.log();
        },
        /**
         * @override
         */
        onBeforeRendering: function () {
          console.log("beforeRendering");
        },
        /**
         * @override
         */
        onButAction: function () {
          MessageToast.show("Datos Personales");
        },
      }
    );
  }
);