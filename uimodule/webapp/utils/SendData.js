sap.ui.define(
  ["sap/ui/base/ManagedObject", "sap/m/MessageBox"],
  function (ManagedObject, MessageBox) {
    "use strict";

    return ManagedObject.extend("bafar.flujos.flujos.utils.SendData", {
      constructor: function () {
        var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        this.createModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
      },
      mapData: function (inData) {
        var flowInfo = inData.flowInfo;
        var arrData = inData.flowData;
        switch (flowInfo.departamento + flowInfo.actividad + flowInfo.proceso) {
          case "NOM001001":
            this.NOM001001(flowInfo, arrData);
            break;
          case "NOM001002":
            this.NOM001002(flowInfo, arrData);
            break;
          default:
            break;
        }
      },
      submitCall: function (oPayload) {
        // var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        // oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
        // var oModel = this.getModel("createModel");        
        var that = this;
        this.createModel.create("/BaseSet", oPayload, {
          async: true,
          success: function (req, res) {
            that.creationBackAccepted(res.data);
          },
          error: function (error) {
            that.creationBackFail(error);
          },
        });
      },
      creationBackFail: function (error) {
        MessageBox.error(error.responseText);
      },
      creationBackAccepted: function (res) {
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("flowCreation", "flowBackResult", res);
      },
      NOM001001: function (flowInfo, arrData) {
        var oPayload = {
          P1: "SEND",
          to_pesal: [{
            C1: "REG",
            C5: "Flujo Pension",
            C6: flowInfo.departamento,
            C7: flowInfo.actividad,
            C8: flowInfo.proceso,
            C9: flowInfo.id,
            C10: "000001",
            C11: arrData.C11,
            C12: arrData.C12,
            C13: arrData.C13,
            C14: arrData.C14,
            C15: arrData.C15,
            C16: arrData.C16,
            C17: arrData.C17,
            C18: arrData.C18,
            C19: arrData.C19,
            C20: arrData.C20,
            C21: arrData.C21,
            C22: arrData.C22,
            C23: arrData.C23,
            C24: arrData.C24,
            C25: arrData.C25,
            C26: arrData.C26,
            C27: arrData.C27,
            C28: arrData.C28,
            C29: arrData.C29,
            C30: arrData.C30,
            C31: arrData.C31,
            C32: arrData.C32,
            C33: arrData.C33,
            C34: arrData.C34,
          }, ],
        };
        this.submitCall(oPayload);
      },
      NOM001002: function (flowInfo, arrData) {
        var to_pesal = [];
        arrData.forEach(element => {
          to_pesal.push({
            C1: "REG",
            C5: element.in3,
            C6: flowInfo.departamento,
            C7: flowInfo.actividad,
            C8: flowInfo.proceso,
            C9: flowInfo.id,
            C10: element.head1,
            C11: element.head2,
            C12: element.head3,
            C13: element.vis1,
            C14: element.in1,
            C15: element.vis2,
            C16: element.vis3,
            C17: element.vis4,
            C18: element.in2,
            C19: element.vis5,
            C20: element.in3,
            C21: element.in4,
            C22: element.in5,
            C23: element.vis6,
            C24: element.vis7
          })
        });
        var oPayload = {
          P1: "SEND",
          to_pesal: to_pesal
        };
        // this.submitCall(oPayload);
      }
    });
  }
);