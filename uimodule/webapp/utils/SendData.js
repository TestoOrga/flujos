sap.ui.define(
  ["sap/ui/base/ManagedObject", "sap/m/MessageBox"],
  function (ManagedObject, MessageBox) {
    "use strict";

    return ManagedObject.extend("bafar.flujos.flujos.utils.SendData", {
      constructor: function (oComponent) {
        this.oComponent = oComponent;
        this.oEventBus = oComponent.getEventBus();
        var sServiceUrl = "/sap/opu/odata/sap/ZOD_FLUJOS_IN_SRV";
        this.createModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
      },
      mapData: function (inData, approveCode) {
        var flowInfo = inData.flowInfo;
        var arrData = inData.flowData;
        switch (approveCode || flowInfo.departamento + flowInfo.actividad + flowInfo.proceso) {
          case "NOM001001":
            this.NOM001001(flowInfo, arrData || inData, approveCode ? true : false);
            break;
          case "NOM001002":
            this.NOM001002(flowInfo, arrData || inData, approveCode ? true : false);
            break;
          case "NOM001003":
            this.NOM001003(flowInfo, arrData || inData, approveCode ? true : false);
            break;
          case "NOM001004":
            this.NOM001004(flowInfo, arrData || inData, approveCode ? true : false);
            break;
          default:
            break;
        }
      },
      submitCall: function (oPayload) {
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
        this.oEventBus.publish("flowCreation", "flowBackResult");
      },
      creationBackAccepted: function (res) {
        this.oEventBus.publish("flowCreation", "flowBackResult", res);
      },
      NOM001001: function (flowInfo, arrData, approve) {
        if (!approve) {
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
              C40: arrData.C40
            }, ],
          };
        } else {
          // arrData.C1 = "APP";
          var oPayload = {
            P1: "APP",
            to_pesal: arrData
          };
        }
        this.submitCall(oPayload);
      },
      NOM001002: function (flowInfo, arrData, approve) {
        var to_pesal = [];
        if (!approve) {
          arrData.forEach(element => {
            to_pesal.push({
              C1: "REG",
              C5: element.in3, //motivo
              C6: flowInfo.departamento,
              C7: flowInfo.actividad,
              C8: flowInfo.proceso,
              C9: flowInfo.id,
              C10: element.vis1, //item
              C11: element.head1, //sociedad
              C12: element.head2, //division
              C13: element.head3, //tipo 
              C14: element.in1,
              C15: element.vis2,
              C16: element.vis3,
              C17: element.vis4,
              C18: element.in2,
              C19: element.vis5,
              C20: element.in3,
              C21: element.in4,
              C22: element.in5,
              C23: element.in6,
              C24: element.vis6,
              C25: element.vis7
            })
          });
          var oPayload = {
            P1: "SEND",
            to_pesal: to_pesal
          };
        } else {
          to_pesal = arrData;
          // to_pesal.forEach(element => {
          //   element.C1 = "APP";
          // });
          var oPayload = {
            P1: "APP",
            to_pesal: to_pesal
          };
        }
        this.submitCall(oPayload);
      },
      NOM001003: function (flowInfo, arrData, approve) {
        var to_pesal = [];
        if (!approve) {
          arrData.forEach(element => {
            to_pesal.push({
              C1: "REG",
              C5: element.in5,
              C6: flowInfo.departamento,
              C7: flowInfo.actividad,
              C8: flowInfo.proceso,
              C9: flowInfo.id,
              C10: element.vis1, //item
              C11: element.head1,
              C12: element.head2,
              C13: element.head3,
              C14: element.in1,
              C15: element.vis2,
              C16: element.vis3,
              C17: element.vis4,
              C18: element.vis5,
              C19: element.in2Num,
              C20: element.vis6,
              C21: element.in3,
              C22: element.in4Num,
              C23: element.in5
            })
          });
          var oPayload = {
            P1: "SEND",
            to_pesal: to_pesal
          };
        } else {
          to_pesal = arrData;
          // to_pesal.forEach(element => {
          //   element.C1 = "APP";
          // });
          var oPayload = {
            P1: "APP",
            to_pesal: to_pesal
          };
        }
        this.submitCall(oPayload);
      },
      NOM001004: function (flowInfo, arrData, approve) {
        var to_pesal = [];
        if (!approve) {
          arrData.forEach(element => {
            to_pesal.push({
              C1: "REG",
              C5: element.in5,
              C6: flowInfo.departamento,
              C7: flowInfo.actividad,
              C8: flowInfo.proceso,
              C9: flowInfo.id,
              C10: element.vis1, //item
              C11: element.head1,
              C12: element.head2,
              C13: element.head3,
              C14: element.in1,
              C15: element.vis2,
              C16: element.in2Num,
              // C17: element.in4,
              // C18: element.in3,              
              C17: element.in3,
              C18: element.in4,
              C19: element.vis3,
              C21: element.vis4,
              C22: element.vis5
            });
          });
          var oPayload = {
            P1: "SEND",
            to_pesal: to_pesal
          };
        } else {
          to_pesal = arrData;
          var oPayload = {
            P1: "APP",
            to_pesal: to_pesal
          };
        }
        this.submitCall(oPayload);
      }
    });
  }
);