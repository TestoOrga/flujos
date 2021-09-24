sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (BaseController,
    JSONModel,
    MessageBox) {
    "use strict";

    return BaseController.extend("bafar.flujos.flujos.controller.Aprobacion", {
      /**
       * @override
       */
      onInit: function () {
        //   Controller.prototype.onInit.apply(this, arguments);
        // this.getOwnerComponent().getCatDataComp(oPayload, oModel)
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteApprovalView").attachPatternMatched((oEvent) => {
          console.log("loaded");
          this.createModel = this.getModel("createModel");
          var oPayload = {
            P1: "LAPP",
            // P2: "SY-UNAME",
            P2: "925",
            to_pesal: []
          };
          var that = this;
          this.createModel.create("/BaseSet", oPayload, {
            async: true,
            success: function (req, res) {
              that.addDescrp(res.data.to_pesal.results);
              that.setModel(new JSONModel(res.data.to_pesal.results), "lazyModel");
              that.tabModel = that.getModel("lazyModel");
            },
            error: function (error) {
              MessageBox.error(error.responseText);
            }
          });
          // var oModelData = {
          //   IniSet: [{
          //       Name: "asdsad",
          //       tipo: "NOM",
          //       color: "Accent1",
          //       state: "Error",
          //       Role: "asdfffasdfasfdasddfasfaasdfasdfasdfasdfs"
          //     },
          //     {
          //       Name: "xxxxxx",
          //       tipo: "FI",
          //       color: "Accent2",
          //       state: "Success",
          //       Role: "asdfffasdfasfdasddfasdfasdfasdfasdfasfas"
          //     },
          //   ],
          // };
        }, this);
      },
      addDescrp: function (oRes) {
        var flowDesc = this.getOwnerComponent().flowDescMap;
        oRes.forEach(element => {
          var flujo = flowDesc.find(x => x[element.C2]);
          if (flujo) {
            var desc = flujo[element.C2];
            element.block = desc.txt;
            var descAct = desc.act.find(x => x[element.C3]);
            element.act = descAct[element.C3].txt;
            var descPro = descAct[element.C3].pro.find(x => x[element.C4]);
            element.pro =  descPro[element.C4];
          };
        });
        console.log('');        
      },
      onSelectionChange: function (oEvent) {
        var oObject = oEvent
          .getParameter("listItem")
          .getBindingContext("lazyModel")
          .getObject();
        oObject.icon = this.byId("list").getSelectedItem().getAggregation('content')[0].getAggregation('items')[0].getAggregation("items").find(x => x.sId.includes("Avatar")).getSrc();
        var approvalModel = this.getOwnerComponent().getAprovalModel();
        approvalModel.setProperty("/", oObject);
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("userDetailRoute",{code: oObject.Code});
        oRouter.navTo("RouteApprovalFlowView", {
          flow: oObject.Name,
        });
      },

      onSearch: function (oEvent) {
        console.log('Event Handler: ');
      },
    });
  }
);