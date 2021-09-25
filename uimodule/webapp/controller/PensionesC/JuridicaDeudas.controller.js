sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageBox",
    "bafar/flujos/flujos/model/formatter"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, JSONModel, XMLView, MessageBox, formatter) {
    "use strict";
    var oModel,
      oODataJSONModel,
      sServiceUrl,
      oDataResults,
      numeroOrdenDate,
      oEntityUnidadIntervalo,
      claveBancoKey,
      claveBancoText,
      juridicaDeudasModel;

    var juridicaDeudasData = [];
    // var juridicaDeudasData = {
    //   ClaveBanco: "",
    //   vViaPago: "",
    //   Receptor: "",
    //   CuentaBancaria: "",
    //   NumeroOrden: "",
    //   TipoDescuento: "",
    //   UnidadIntervalo: ""
    // }

    return Controller.extend("namespace.name.project3.controller.View1", {
      formatter: formatter,
      onInit: function () {

        oDataResults = [];
        oODataJSONModel = new sap.ui.model.json.JSONModel();
        sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
        oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

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


        oModel.create("/BaseSet", oEntityClaveBanco, {
          success: function (oData, oResponse) {
            // Success
            // sap.m.MessageToast.show(" Created Successfully");
            window.console.log(oData.to_pesal.results);
            var data = oODataJSONModel.getData();
            data.claveBanco = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            MessageBox.error("Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityViaPago, {
          success: function (oData, oResponse) {
            // Success
            // sap.m.MessageToast.show(" Created Successfully");
            //window.console.log(oData.to_pesal);
            var data = oODataJSONModel.getData();
            data.viaPago = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            MessageBox.error("Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityTipoDescuento, {
          success: function (oData, oResponse) {
            // Success
            // sap.m.MessageToast.show(" Created Successfully");
            //window.console.log(oData.to_pesal);
            var data = oODataJSONModel.getData();
            data.tipoDescuento = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal;
            //window.console.log(oDataResults)
          },

          error: function (oError) {
            // Error
            MessageBox.error("Creation failed");
          },
        });

        this.getView().setModel(oODataJSONModel);
        window.console.log(oODataJSONModel);

        //Funcionalidad fecha actual start
        this.getDate();
        //Funcionalidad fecha actual end

        //

        //
        //eventlisteners
        this.oEventBus = this.getOwnerComponent().getEventBus();
        this.oEventBus.subscribe("flowRequest", "valFlow", this.getValInputs, this);
        this.oEventBus.subscribe("flowRequest", "flowData", this.getData, this);
      },
      onExit: function () {
        
        this.oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
        this.oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
      },

      onButAction: function (oEvent, param) {
        MessageToast.show(param);
      },
      onSelectDescuento: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var oSelectUnidadIntervalo = this.getView().byId("_unidadIntervalo");
        if (selectedItem) {
          var descuentoKey = selectedItem.getKey();
          var descuentoText = selectedItem.getBindingContext().getObject().C2;
          this.getView().byId("_tipoDescuentoInput").setValue(descuentoText);
          oEntityUnidadIntervalo.P3 = descuentoKey;
          this.getView().byId("_unidadIntervalo").setEnabled(true);
          this.getView().byId("_unidadIntervaloLabel").setText("Unidad Intervalo");
        } else {
          this.getView().byId("_unidadIntervalo").setEnabled(false);
        }

        oModel.create("/BaseSet", oEntityUnidadIntervalo, {
          success: function (oData, oResponse) {
            // Success
            // sap.m.MessageToast.show(" Created Successfully");
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

        // var descuentoSplit = descuentoText.split(" ")[1];
        this.getView().byId("descuentoCurrLabel").setVisible(true);
        this.getView().byId("descuentoCurrLabel").setText(descuentoText);
        this.getView().byId("descuentoCurr").setVisible(true);


      },
      onSelectClaveBanco: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        claveBancoKey = selectedItem.getKey();
        claveBancoText = selectedItem.getBindingContext().getObject().C2;
        this.getView().byId("_claveBancoInput").setValue(claveBancoText);
      },
      onSelectViaPago: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var viaPagoKey = selectedItem.getKey();
        var viaPagoText = selectedItem.getBindingContext().getObject().C2;
        this.getView().byId("_viaPagoInput").setValue(viaPagoText);
      },
      onSelectUnidadIntervalo: function (oEvent) {
        var selectedItem = oEvent.getParameter("selectedItem");
        var unidadIntervaloKey = selectedItem.getKey();
        var unidadIntervaloText = selectedItem.getBindingContext().getObject().C2;
        this.getView().byId("_unidadIntervaloInput").setValue(unidadIntervaloText);
      },
      //Funcionalidad fecha actual 
      getDate: function () {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var hour = today.getHours();
        var Minutes = today.getMinutes();
        var Seconds = today.getSeconds();
        var today1 = (dd + "." + mm.toString().padStart(2, "0") + "." + yyyy);
        numeroOrdenDate = this.getView().byId("numeroOrdenDate");
        if (typeof (numeroOrdenDate) !== "undefined") {
          numeroOrdenDate.setValue(today1);
        }
      },
      //Funcionalidad fecha actual

      //Validate Fields Juridica Deudas
      validateFieldsJuridicaDeudas: function () {

        var juridicaDeudasFields = [
          "cveBancoSelect",
          "_viaPagoSelect",
          "receptor",
          "cuentaBancariaInput",
          "numeroOrdenInput",

          "_tipoDescuento",
          "_unidadIntervalo",
          "descuentoCurr"
        ];
        var error = false;
        for (var i = 0; i < juridicaDeudasFields.length; i++) {
          var value = "";
          if (this.getView().byId(juridicaDeudasFields[i])) {
            try {
              value = this.getView().byId(juridicaDeudasFields[i]).getValue();
            } catch (oError) {
              try {
                value = this.getView().byId(juridicaDeudasFields[i]).getSelectedKey();
              } catch (oError) {
                value = this.getView().byId(juridicaDeudasFields[i]).getSelected();
              }
            }

            if (value) {
              value = parseFloat(value);
            }
            if (value === "" || value === false || value === 0) {
              this.getView().byId(juridicaDeudasFields[i]).setValueState("Error");
              var error = true;
            } else {
              this.getView().byId(juridicaDeudasFields[i]).setValueState("None");
            }
          }
        }
        error = this.valClave(error);
        error = this.valCantidad(error);

        if (error) {
          return false;
        } else {
          return true;
        }
      },

      valCantidad: function (error) {
        try {
          if (this.byId("descuentoCurr").getValue().includes("NaN") ||
            Number(this.byId("descuentoCurr").getValue()) >= 0) {
            this.byId("descuentoCurr").setValueState("Error");
            return true;
          } else {
            this.byId("descuentoCurr").setValueState("None");
            return error;
          };
        } catch (oError) {
          return error;
        };
      },

      valClave: function (error) {
        try {
          var clave = (this.byId("cuentaBancariaInput").getValue().length);
          if (clave < 18) {
            this.byId("cuentaBancariaInput").setValueState("Error");
            return true;
          } else {
            this.byId("cuentaBancariaInput").setValueState("None");
            return error;
          };
        } catch (oError) {
          return error;
        };
      },

      //Validate Fields JuridicaDeudas

      //Guardado JuridicaDeudas
      saveJuridicaDeudasData: function () {

        // var claveBancoSplit = claveBancoText.split(" ")[0];
        if (this.getView().byId("_viaPagoSelect")) {
          var juridicaData = {
            C22: this.getView().byId("numeroOrdenInput").getValue(),
            C23: this.formatter.dateToAbap(this.getView().byId("numeroOrdenDate").getValue(), "."),
            C24: this.getView().byId("receptor").getValue(),
            C25: this.byId("cveBancoSelect").getSelectedKey(),
            C26: this.byId("_claveBancoInput").getValue(),
            C27: this.getView().byId("cuentaBancariaInput").getValue(),
            C28: this.getView().byId("_viaPagoSelect").getSelectedKey(),
            C29: this.getView().byId("_viaPagoInput").getValue()
          }
          return juridicaData;
        } else {
          var deudasData = {
            C30: this.getView().byId("_tipoDescuento").getSelectedKey(),
            C31: this.getView().byId("_tipoDescuentoInput").getValue(),
            C32: this.getView().byId("_unidadIntervalo").getSelectedKey(),
            C33: this.getView().byId("_unidadIntervaloInput").getValue(),
            C34: this.currencyNum,
          };
          return deudasData;
        }

        //GuardadoJuridicaDeudas


        /*juridicaDeudasData = {
            ClaveBanco: "test",
            vViaPago: "test",
            Receptor: "test",
            CuentaBancaria: "test",
            NumeroOrden: "test",
            TipoDescuento: "test",
            UnidadIntervalo: "test"
        }*/


        /*juridicaDeudasModel = new sap.ui.model.json.JSONModel();
        juridicaDeudasModel.setData(juridicaDeudasData);*/
      },


      //Descuento Currency field format
      formatCurrency: function () {
        var percent = this.byId("descuentoCurrLabel").getText().includes("orcent");
        var options = (!percent ? {
          style: "currency",
          currency: "USD"
        } : {
          style: "percent",
          minimumFractionDigits: 2
        });
        var formatter = new Intl.NumberFormat("en-us", options);
        var currencyT = this.getView().byId("descuentoCurr").getValue();
        var currency = isNaN(Number(currencyT)) ? 0 : currencyT;
        this.currencyNum = currency;
        var currencyFormated = formatter.format(percent ? currency / 100 : currency);
        this.getView().byId("descuentoCurr").setValue(currencyFormated);

        /*var currency = this.getView().byId("descuentoCurr").getValue();
        var currencyFormated = currency + ".00"
        this.getView().byId("descuentoCurr").setValue(currencyFormated);*/
      },
      //Descuento Currency field Format

      validateNumericValues: function (oEvent) {
        var inputCurrency = oEvent.getSource();
        var val = inputCurrency.getValue();
        val = val.replace(/[^\d]/g, "");
        inputCurrency.setValue(val);
      },
      onButAction: function () {
        this.validateFieldsJuridicaDeudas();
      },
      getValInputs: function () {
        
        var result = this.validateFieldsJuridicaDeudas();
        this.oEventBus.publish("flowResults", "flowValid", {
          res: result
        });
      },
      getData: function () {
        
        var result = this.saveJuridicaDeudasData();
        this.oEventBus.publish("flowResults", "flowData", {
          res: result
        });
      },

      claveInput: function (oEvent) {
        oEvent.oSource.setValue(oEvent.getParameter("newValue").replace(/\D/g, ""));
      },

      numOrdenLiveChange: function (oEvent) {
        oEvent.oSource.setValue(oEvent.getParameter("newValue").replace(/\D/g, ""));
      },

      cantLiveChange: function (oEvent) {
        // oEvent.oSource.setValue(oEvent.getParameter("newValue").replace(/\D/g, ""));
      }
    });
  });