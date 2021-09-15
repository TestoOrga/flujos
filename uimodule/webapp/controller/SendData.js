sap.ui.define(
  ["sap/ui/base/ManagedObject", "sap/m/MessageBox"],
  function (ManagedObject, MessageBox) {
    "use strict";

    return ManagedObject.extend("bafar.flujos.flujos.controller.SendData", {
      constructor: function () {
        var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        this.createModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
      },
      mapData: function (flow, arrData) {
        switch (flow) {
          case "NOM001001":
            this.NOM001001(arrData);
            break;
          default:
            break;
        }
      },
      submitCall: function (oPayload) {
        // var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        // oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
        var oModel = this.getModel("createModel");
        oModel.create("/BaseSet", oPayload, {
          async: true,
          success: function (req, res) {
            this.creationSuccess(res.data.to_pesal.results);
          },
          error: function (error) {
            this.creationFail(arrData, error);
          },
        });
      },
      creationFail: function (error) {
        MessageBox.error(error.responseText);
      },
      creationSuccess: function (res) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowCreation", "flowBackResult", res);
      },
      NOM001001: function (arrData) {
        var oPayload = {
          P1: "SEND",
          to_pesal: [{
            C1: "REG",
            C11: arrData[1][0],
            C12: arrData[1][1],
            C13: arrData[1][2],
            C14: arrData[1][3],
            C15: arrData[1][4],
            C16: arrData[1][5],
            C17: arrData[1][6],
            C18: arrData[1][7],
            C19: arrData[1][8],
            C20: arrData[1][9],
            C21: arrData[1][10],
            C22: arrData[2].ClaveBanco,
            C23: arrData[2].CuentaBancaria,
            C24: arrData[2].NumeroOrden,
            C25: arrData[2].Receptor,
            C26: arrData[2].ViaPago,
            C27: arrData[0].CantDescuento,
            C28: arrData[0].TipoDescuento,
            C29: arrData[0].UnidadIntervalo,
          }, ],
        };
        this.submitCall(oPayload);
      },
    });
  }
);