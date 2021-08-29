sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("bafar.flujos.flujos.controller.Accion", {
    onInit: function () {
      this.blockMap = Object.create(null);
      this.blockMap.creacion = "blockCreacion";
      this.blockMap.seguimiento = "blockSeguimiento";
      this.blockMap.aprobacion = "blockAprobacion";
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("RouteAccionView").attachPatternMatched(this.onPageLoaded, this);
    },
    onPageLoaded: function (oEvent) {
      this.oUserCode = oEvent.getParameter("arguments").code;
      this.mainModel = this.getView().getModel();
      this.mainModel.setUseBatch(false);
      var blockRequest = {
        P2: "",
        P2: "BLOQUE",
        p3: "USER"
      };
      this.getModelData(blockRequest).then((resData) => {
        resData.data.to_pesal.forEach(element => {
          this.enableBlock(this.blockMap[element.C1], element.C2, true);
        });
      }).catch((error) => {
        MessageBox.error(error);
      });
    },
    getModelData: function (oPayLoad) {
      return new Promise((resolve, reject) => {
        this.mainModel.create("/BaseSet", oPayLoad, {
          success: function (req, res) {
            resolve(res);
          },
          reject: function (error) {
            reject(error);
          }
        });
      });
    },
    enableBlock: function (sId, enable, init) {
      if (sId) {
        var oControl = this.byId(sId);
        if (oControl && enable) {
          oControl.removeStyleClass("dashboardDisabled");
          oControl.addStyleClass("dashboardEnabled");
          oControl.data("enabled", true);
        } else if (!init) {
          oControl.data("enabled", false);
          oControl.removeStyleClass("dashboardEnabled");
          oControl.addStyleClass("dashboardDisabled");
        }
      }
    },
    onPress: function (oEvent) {
      if (oEvent.getSource().data("enabled")) {
        this.navTo("RouteHeaderFlujosView");
      } else {
        MessageBox.error(this.get18().getText("sinAutorizacion"));
      }
    }
  });
});