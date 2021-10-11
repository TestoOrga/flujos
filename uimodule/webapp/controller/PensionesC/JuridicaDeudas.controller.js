sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "bafar/flujos/flujos/model/formatter"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, JSONModel, MessageBox, formatter) {
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

    return Controller.extend("namespace.name.project3.controller.View1", {
      formatter: formatter,
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

        oDataResults = [];
        oODataJSONModel = new sap.ui.model.json.JSONModel();
        sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_SRV";
        oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

        var oEntityClaveBanco = {
          P1: "CAT",
          P2: "BANKL",
          to_pesal: [],
        };

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

        oModel.create("/BaseSet", oEntityClaveBanco, {
          success: function (oData, oResponse) {
            window.console.log(oData.to_pesal.results);
            var data = oODataJSONModel.getData();
            data.claveBanco = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
          },

          error: function (oError) {
            // Error
            MessageBox.error("Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityViaPago, {
          success: function (oData, oResponse) {
            var data = oODataJSONModel.getData();
            data.viaPago = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal.results;
          },

          error: function (oError) {
            // Error
            MessageBox.error("Creation failed");
          },
        });

        oModel.create("/BaseSet", oEntityTipoDescuento, {
          success: function (oData, oResponse) {
            var data = oODataJSONModel.getData();
            data.tipoDescuento = oData.to_pesal.results;
            oODataJSONModel.setData(data);
            oDataResults = oData.to_pesal;
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

        //Aprobacion
        this.oEventBus.subscribe("flowApproval", "loadViewData", this.loadData, this);
        this.oEventBus.subscribe("flowApproval", "editMode", this.editMode, this);
        this.oEventBus.subscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
      },
      onExit: function () {
        this.oEventBus.unsubscribe("flowRequest", "valFlow", this.getValInputs, this);
        this.oEventBus.unsubscribe("flowRequest", "flowData", this.getData, this);
        this.oEventBus.unsubscribe("flowApproval", "loadViewData", this.loadData, this);
        this.oEventBus.unsubscribe("flowApproval", "editMode", this.editMode, this);
        this.oEventBus.unsubscribe("flowRequest", "flowDataApprove", this.getDataForApproval, this);
      },
      getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
        const currentHash = router.getHashChanger().getHash();
        return this.getOwnerComponent().getMode(currentHash); // since 1.75
      },

      onButAction: function (oEvent, param) {
        MessageToast.show(param);
      },
      onSelectDescuento: function (oEvent, oSelectedItem) {
        var selectedItem = oEvent ? oEvent.getParameter("selectedItem") : oSelectedItem;
        var oSelectUnidadIntervalo = this.getView().byId("_unidadIntervalo");
        if (selectedItem) {
          var descuentoKey = selectedItem.getKey();
          var descuentoText = selectedItem.getBindingContext().getObject().C2;
          this.getView().byId("_tipoDescuentoInput").setValue(descuentoText);
          oEntityUnidadIntervalo.P3 = descuentoKey;
          this.getView().byId("_unidadIntervalo").setEnabled(oSelectedItem ? false : true);
          this.getView().byId("_unidadIntervaloLabel").setText("Unidad Intervalo");
        } else {
          this.getView().byId("_unidadIntervalo").setEnabled(false);
        }

        oModel.create("/BaseSet", oEntityUnidadIntervalo, {
          success: function (oData, oResponse) {
            var data = oODataJSONModel.getData();
            data.unidadIntervalo = oData.to_pesal.results;
            oODataJSONModel.setData(data);
          },

          error: function (oError) {
            // Error
            sap.m.MessageToast.show(" Creation failed");
          },
        })
        oSelectUnidadIntervalo.setModel(oODataJSONModel);

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
      },
      loadData: function (sChannel, oEvent, res) {
        switch (res.view) {
          case "JURIDICA":
            this.backDataJuridica = res.data;
            // Map separado por si async
            this.mapJuridica();
            break;
          case "DEUDAS":
            this.backDataDeudas = res.data;
            // Map separado por si async
            this.mapDeudas();
            break;
          default:
            break;
        }
      },
      mapDeudas: function () {
        if (this.byId("_tipoDescuento")) {
          this.byId("_tipoDescuento").setSelectedKey(this.backDataDeudas.C46);
          this.onSelectDescuento(undefined, this.byId("_tipoDescuento").getSelectedItem());
          this.byId("_unidadIntervalo").setSelectedKey(this.backDataDeudas.C48);
          this.byId("_unidadIntervaloInput").setValue(this.backDataDeudas.C49);
          this.byId("descuentoCurr").setValue(this.backDataDeudas.C50);
          this.formatCurrency();
        }
      },
      mapJuridica: function () {
        if (this.byId("numeroOrdenInput")) {
          this.byId("numeroOrdenInput").setValue(this.backDataJuridica.C38);
          this.byId("numeroOrdenDate").setValue(this.backDataJuridica.C39);
          this.byId("receptor").setValue(this.backDataJuridica.C40);
          this.byId("cveBancoSelect").setSelectedKey(this.backDataJuridica.C41);
          this.byId("_claveBancoInput").setValue(this.backDataJuridica.C42);
          this.byId("cuentaBancariaInput").setValue(this.backDataJuridica.C43);
          this.byId("_viaPagoSelect").setSelectedKey(this.backDataJuridica.C44);
          this.byId("_viaPagoInput").setValue(this.backDataJuridica.C45);
        }
      },
      getDataForApproval: function () {
        if (this.getView().byId("_tipoDescuento")) {
          var result = {
            C46: this.getView().byId("_tipoDescuento").getSelectedKey(),
            C47: this.getView().byId("_tipoDescuentoInput").getValue(),
            C48: this.getView().byId("_unidadIntervalo").getSelectedKey(),
            C49: this.getView().byId("_unidadIntervaloInput").getValue(),
            C50: this.currencyNum,
          };
          // return juridicaData;
        } else {
          var result = {
            C38: this.getView().byId("numeroOrdenInput").getValue(),
            C39: this.formatter.dateToAbap(this.getView().byId("numeroOrdenDate").getValue(), "."),
            C40: this.getView().byId("receptor").getValue(),
            C41: this.byId("cveBancoSelect").getSelectedKey(),
            C42: this.byId("_claveBancoInput").getValue(),
            C43: this.getView().byId("cuentaBancariaInput").getValue(),
            C44: this.getView().byId("_viaPagoSelect").getSelectedKey(),
            C45: this.getView().byId("_viaPagoInput").getValue()
          };
          // return deudasData;
        }
        // var result = this.saveJuridicaDeudasData();
        this.oEventBus.publish("flowResults", "flowData", {
          res: result
        });
      },
      editMode: function (sChannel, oEvent, res) {
        this.getView().getModel("afterCreation").setProperty("/enabled", res.edit);
      }
    });
  });