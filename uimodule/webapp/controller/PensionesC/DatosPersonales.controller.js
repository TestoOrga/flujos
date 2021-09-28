/* eslint-disable no-console */
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "bafar/flujos/flujos/libs/filesaver", "bafar/flujos/flujos/libs/xlsx.full.min",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/HashChanger",
    "sap/m/MessageBox"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller,
    MessageToast,
    filesaver,
    XlsxFullmin,
    JSONModel,
    HashChanger,
    MessageBox) {
    "use strict";

    var noPersonalIn;
    var fechIniRet;

    return Controller.extend(
      "bafar.flujos.flujos.controller.PensionesC.DatosPersonales", {
        onInit: function () {
          // Modo Aprobacion          
          if (this.getOwnerComponent().currentMode === 3 || this.getCurrentRouteName() === 3) {
            this.getView().setModel(new JSONModel({
              noEditField: false,
              creation: false,
              enabled: false
            }), "afterCreation");
          } else {
            this.getView().setModel(new JSONModel({
              noEditField: true,
              creation: true
            }), "afterCreation");
          };

          window.console.log("Se inicia onInit");
          //eventlisteners
          this.oEventBus = this.getOwnerComponent().getEventBus();
          this.oEventBus.subscribe("flowRequest", "valFlow", this.getValInputs, this);
          this.oEventBus.subscribe("flowRequest", "flowData", this.getData, this);
          this.oEventBus.subscribe("flowResult", "dataError", this.showErrorTable, this);

          this.oEventBus.subscribe("flowCreated", "releaseFiles", this.releaseFiles, this);
          this.oEventBus.subscribe("flowCreated", "releaseFilesEnded", this.releaseFilesEnded, this);

          // Aprobacion
          this.oEventBus.subscribe("flowApproval", "loadFlowData", this.applyData, this);
          this.oEventBus.subscribe("flowApproval", "editMode", this.editMode, this);
          this.oEventBus.subscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
        },
        onExit: function () {

          this.oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
          this.oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
          this.oEventBus.unsubscribe("flowResult", "dataError", this.showErrorTable, this);

          this.oEventBus.unsubscribe("flowCreated", "releaseFiles", this.releaseFiles, this);
          this.oEventBus.unsubscribe("flowCreated", "releaseFilesEnded", this.releaseFilesEnded, this);

          // Aprobacion
          this.oEventBus.unsubscribe("flowApproval", "loadFlowData", this.applyData, this);
          this.oEventBus.unsubscribe("flowApproval", "editMode", this.editMode, this);
          this.oEventBus.unsubscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
        },
        getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
          const currentHash = router.getHashChanger().getHash();
          return this.getOwnerComponent().getMode(currentHash); // since 1.75
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
            MessageBox.error("No existen registros");
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
              this.byId("fechaIniRet_Input").setValue("");
              MessageBox.error("No existen registros");
            }

            // Seteat campo Fecha Ini Ret
            fechIniRet = oDataResults2[0].C1;
            this.getView().byId("fechaIniRet_Input").setValue(fechIniRet);
          } else {
            MessageBox.error("Favor de validar los campos Área Nómina / Periodo de retención");
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

          var datosPersonalesData = {};
          var firstC = 11;
          for (var i = 0; i < datosPersonalesFields.length; i++) {
            var backId = "C" + firstC;
            datosPersonalesData[backId] = this.getView().byId(datosPersonalesFields[i]).getValue();
            firstC++;
          }
          //Ajustes especificos
          datosPersonalesData.C40 = datosPersonalesData.C22;
          return datosPersonalesData;
          //console.log(datosPersonalesData);
        },

        onValidateInputs: function () {
          var datosPersonalesFields = [
            "noPeronsal_Input",
            // "noPeronsal_Input1",
            // "sociedad_Input",
            // "sociedad_Input1",
            // "division_Input",
            // "division_Input1",
            // "funcion_Input",
            // "funcion_Input1",
            // "areaNomina_Input",
            "periodoRet_Input",
            "periodoRet_Input1",
            // "fechaIniRet_Input",
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
        getValInputs: function () {

          var result = !this.onValidateInputs();
          this.oEventBus.publish("flowResults", "flowValid", {
            res: result
          });
        },
        getData: function () {

          var result = this.onGetDataFromInput();
          this.oEventBus.publish("flowResults", "flowData", {
            res: result
          });
        },
        releaseFiles: function () {
          this.oEventBus.publish("flowCreated", "fileReleaseStart");
        },

        releaseFilesEnded: function () {
          this.oEventBus.publish("flowCreated", "EndFlow");
        },
        periodoInput: function (oEvent) {
          oEvent.oSource.setValue(oEvent.getParameter("newValue").replace(/\D/g, ""));
        },
        //Usa este controlador como el principal, no es necesario mostrar errores en todos los controladores
        showErrorTable: function (sChannel, oEvent, res) {
          var fragRes = {
            "col1": true,
            "col2": true,
            "col3": true
          };
          this.getOwnerComponent().openErrorFrag(fragRes, res.res.to_pesal.results, this.getOwnerComponent().flowData.id + ": " + res.res.PeMsj);
        },

        // APROBACION
        applyData: function (sChannel, oEvent, res) {
          // console.log(res.res);
          this.mapToView("PERSONALES", res.res[0]);
          this.oEventBus.publish("flowApproval", "loadViewData", {
            data: this.mapToView("JURIDICA", res.res[0]),
            view: "JURIDICA"
          });
          this.oEventBus.publish("flowApproval", "loadViewData", {
            data: this.mapToView("DEUDAS", res.res[0]),
            view: "DEUDAS"
          });
        },

        mapToView: function (view, oData) {
          switch (view) {
            case "PERSONALES":
              this.mapPersonales(oData);
              break;
            case "JURIDICA":
              return this.mapJuridicas(oData);
              // break;
            case "DEUDAS":
              return this.mapDeudas(oData);
              // break;
            default:
              break;
          }
        },
        mapPersonales: function (oData) {
          this.byId("noPeronsal_Input").setValue(oData.C27);
          this.byId("noPeronsal_Input1").setValue(oData.C28);
          this.byId("sociedad_Input").setValue(oData.C29);
          this.byId("sociedad_Input1").setValue(oData.C30);
          this.byId("division_Input").setValue(oData.C31);
          this.byId("division_Input1").setValue(oData.C32);
          this.byId("funcion_Input").setValue(oData.C33);
          this.byId("funcion_Input1").setValue(oData.C34);
          this.byId("areaNomina_Input").setValue(oData.C35);
          this.byId("periodoRet_Input").setValue(oData.C36);
          this.byId("periodoRet_Input1").setValue(oData.C37);
          this.onEnterFechaRet();
        },
        mapJuridicas: function (oData) {
          return {
            C38: oData.C38,
            C39: oData.C39,
            C40: oData.C40,
            C41: oData.C41,
            C42: oData.C42,
            C43: oData.C43,
            C44: oData.C44,
            C45: oData.C45
          };
        },
        mapDeudas: function (oData) {
          return {
            C46: oData.C46,
            C48: oData.C48,
            C49: oData.C49,
            C50: oData.C50,
          };
        },
        getDataForApproval: function () {
          // this.byId("noPeronsal_Input").setValue(oData.C27);
          // this.byId("noPeronsal_Input1").setValue(oData.C28);
          // this.byId("sociedad_Input").setValue(oData.C29);
          // this.byId("sociedad_Input1").setValue(oData.C30);
          // this.byId("division_Input").setValue(oData.C31);
          // this.byId("division_Input1").setValue(oData.C32);
          // this.byId("funcion_Input").setValue(oData.C33);
          // this.byId("funcion_Input1").setValue(oData.C34);
          // this.byId("areaNomina_Input").setValue(oData.C35);
          // this.byId("periodoRet_Input").setValue(oData.C36);
          // this.byId("periodoRet_Input1").setValue(oData.C37);
          // datosPersonalesData.C40 = datosPersonalesData.C22;

          var result = this.onGetDataFromInput();
          var toMod = {
            C27: result.C11,
            C28: result.C12,
            C29: result.C13,
            C30: result.C14,
            C31: result.C15,
            C32: result.C16,
            C33: result.C17,
            C34: result.C18,
            C35: result.C19,
            C36: result.C20,
            C37: result.C21
          };
          this.oEventBus.publish("flowResults", "flowData", {
            res: toMod
          });
        },
        editMode: function (sChannel, oEvent, res) {
          this.getView().getModel("afterCreation").setProperty("/enabled", res.edit);
        }
      }
    );
  }
);