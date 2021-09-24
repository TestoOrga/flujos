sap.ui.define(
  [
    "bafar/flujos/flujos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, JSONModel) {
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
          this.mainModel = this.getModel();
          var oModelData = {
            IniSet: [{
                Name: "asdsad",
                tipo: "NOM",
                color: "Accent1",
                state: "Error",
                Role: "asdfffasdfasfdasddfasfaasdfasdfasdfasdfs"
              },
              {
                Name: "xxxxxx",
                tipo: "FI",
                color: "Accent2",
                state: "Success",
                Role: "asdfffasdfasfdasddfasdfasdfasdfasdfasfas"
              },
            ],
          };
          this.setModel(new JSONModel(oModelData), "lazyModel");
          this.tabModel = this.getModel("lazyModel");
        }, this);
      },
      onSelectionChange: function (oEvent) {
        var oObject = oEvent
          .getParameter("listItem")
          .getBindingContext("lazyModel")
          .getObject();
        oObject.icon = this.byId("list").getSelectedItem().getAggregation('content')[0].getAggregation('items')[0].getAggregation("items").find(x=>x.sId.includes("Avatar")).getSrc();
        var approvalModel = this.getOwnerComponent().getAprovalModel();
        approvalModel.setProperty("/", oObject);
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        // oRouter.navTo("userDetailRoute",{code: oObject.Code});
        oRouter.navTo("RouteApprovalFlowView", {
          flow: oObject.Name,
        });
      },
    });
  }
);