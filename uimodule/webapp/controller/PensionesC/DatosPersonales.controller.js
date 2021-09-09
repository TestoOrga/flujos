/* eslint-disable no-console */
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast) {
    "use strict";

    var noPersonalIn;
    var fechIniRet;

    return Controller.extend(
      "bafar.flujos.flujos.controller.PensionesC.DatosPersonales", {
        onInit: function () {
          window.console.log("Se inicia onInit");
          //eventlisteners
          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.subscribe("flowRequest", "valFlow", this.getValInputs, this);
          oEventBus.subscribe("flowRequest", "flowData", this.getData, this);

        },
        onExit: function () {
          var oEventBus = sap.ui.getCore().getEventBus();
          oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
          oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
        },

        onEnterInputNoPersonal: function (oEvent) {
          noPersonalIn = this.getView().byId("noPeronsal_Input").getValue();
          noPersonalIn.toString();

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
              //sap.m.MessageToast.show(" Created Successfully");
              oODataJSONModel.setData({
                catalogo: oData.to_pesal.results,
              });
              oDataResults = oData.to_pesal.results;
            },

            error: function (oError) {
              // Error
              //sap.m.MessageToast.show(" Creation failed");
            },
          });

          this.getView().setModel(oODataJSONModel);

          // Setear valores a inputs

          this.getView().byId("noPeronsal_Input1").setValue(oDataResults[0].C2);
          this.getView().byId("sociedad_Input").setValue(oDataResults[0].C3);
          this.getView().byId("sociedad_Input1").setValue(oDataResults[0].C16);
          this.getView().byId("division_Input").setValue(oDataResults[0].C5);
          this.getView().byId("division_Input1").setValue(oDataResults[0].C17);
          this.getView().byId("funcion_Input").setValue(oDataResults[0].C10);
          this.getView().byId("funcion_Input1").setValue(oDataResults[0].C14);
          this.getView().byId("areaNomina_Input").setValue(oDataResults[0].C12);

          // Habilitar campo de Periodo de retencion

          if (oDataResults.length > 0) {
            this.getView().byId("periodoRet_Input").setEnabled(true);
            this.getView().byId("periodoRet_Input1").setEnabled(true);
          } else {
            sap.m.MessageToast.show("No existen registros");
          }
        },

        onEnterFechaRet: function () {
          var areaNom = this.getView().byId("areaNomina_Input").getValue();
          var perRet1 = this.getView().byId("periodoRet_Input").getValue();
          var perRet2 = this.getView().byId("periodoRet_Input1").getValue();

          if (areaNom.length > 0 && perRet1.length > 0 && perRet2.length > 0) {
            var oEntityData2 = {
              P1: "CAT",
              P2: "PERIODO",
              P3: areaNom,
              P4: perRet1,
              P5: perRet2,

              to_pesal: [],
            };

            var oDataResults2 = [];
            var oODataJSONModel2 = new sap.ui.model.json.JSONModel();
            var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
            var oModel2 = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

            oModel2.create("/BaseSet", oEntityData2, {
              success: function (oData, oResponse) {
                // Success
                //sap.m.MessageToast.show(" Created Successfully");

                oODataJSONModel2.setData({
                  catalogo: oData.to_pesal.results,
                });
                oDataResults2 = oData.to_pesal.results;
              },

              error: function (oError) {
                // Error
                //sap.m.MessageToast.show(" Creation failed");
              },
            });

            if (oDataResults2.length === 0) {
              sap.m.MessageToast.show("No existen registros");
            }

            // Seteat campo Fecha Ini Ret
            fechIniRet = oDataResults2[0].C1;
            this.getView().byId("fechaIniRet_Input").setValue(fechIniRet);
          } else {
            sap.m.MessageToast.show(
              "Favor de validar los campos Área Nómina / Periodo de retención"
            );
          }
        },

        onGetDataFromInput: function () {
          var datosPersonalesFields = [
            "noPeronsal_Input",
            "noPeronsal_Input1",
            "sociedad_Input",
            "sociedad_Input1",
            "division_Input",
            "division_Input1",
            "funcion_Input",
            "funcion_Input1",
            "areaNomina_Input",
            "periodoRet_Input",
            "periodoRet_Input1",
            "fechaIniRet_Input",
          ];

          var datosPersonalesData = [];

          for (var i = 0; i < datosPersonalesFields.length; i++) {
            datosPersonalesData.push(
              this.getView().byId(datosPersonalesFields[i]).getValue()
            );
          }
          return datosPersonalesData;
          //console.log(datosPersonalesData);
        },

        onValidateInputs: function () {
          var datosPersonalesFields = [
            "noPeronsal_Input",
            "noPeronsal_Input1",
            "sociedad_Input",
            "sociedad_Input1",
            "division_Input",
            "division_Input1",
            "funcion_Input",
            "funcion_Input1",
            "areaNomina_Input",
            "periodoRet_Input",
            "periodoRet_Input1",
            "fechaIniRet_Input",
          ];

          var error = false;
          for (var i = 0; i < datosPersonalesFields.length; i++) {
            var value = "";
            if (this.getView().byId(datosPersonalesFields[i])) {
              try {
                value = this.getView()
                  .byId(datosPersonalesFields[i])
                  .getValue();
              } catch (oError) {
                try {
                  value = this.getView()
                    .byId(datosPersonalesFields[i])
                    .getSelectedKey();
                } catch (oError) {
                  value = this.getView()
                    .byId(datosPersonalesFields[i])
                    .getSelected();
                }
              }

              if (value) {
                value = parseFloat(value);
              }
              if (value === "" || value === false || value === 0) {
                this.getView()
                  .byId(datosPersonalesFields[i])
                  .setValueState("Error");
                var error = true;
              } else {
                this.getView()
                  .byId(datosPersonalesFields[i])
                  .setValueState("None");
              }
            }
          }
          return error;
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
          //MessageToast.show("Datos Personales");
        },
        getValInputs: function(){
          var oEventBus = sap.ui.getCore().getEventBus();
          var result = !this.onValidateInputs();
          oEventBus.publish("flowResults", "flowValid", {res: result});
        },
        getData: function(){
          var oEventBus = sap.ui.getCore().getEventBus();
          var result = this.onGetDataFromInput();
          oEventBus.publish("flowResults", "flowData", {
            res: result
          });
        }
      }
    );
  }
);