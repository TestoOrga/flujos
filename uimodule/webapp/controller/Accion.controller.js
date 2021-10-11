sap.ui.define(["bafar/flujos/flujos/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (BaseController,
  MessageToast,
  MessageBox,
  JSONModel) {
  "use strict";

  return BaseController.extend("bafar.flujos.flujos.controller.Accion", {
    onInit: function () {
      this.getOwnerComponent().accionViewPanel = this.byId("_IDGenPage1");
      this.getOwnerComponent().accionViewPanel.setBusyIndicatorDelay(0);
      this.setModel(new JSONModel({
        movil: "/sap/opu/odata/sap/ZOD_FLUJOS_SRV/ImageSet('MOVIL')/$value",
        desktop: "/sap/opu/odata/sap/ZOD_FLUJOS_SRV/ImageSet('DESKTOP')/$value"
      }), "banner");
      this.blockMap = Object.create(null);
      this.blockMap.creacion = "blockCreacion";
      this.blockMap.seguimiento = "blockSeguimiento";
      this.blockMap.aprobacion = "blockAprobacion";
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("RouteAccionView").attachPatternMatched(this.onPageLoaded, this);
    },
    onPageLoaded: function (oEvent) {
      this.mainModel = this.getView().getModel();
      this.mainModel.setUseBatch(false);

      //TODO: Agregar validacion de acciones por usuario 
      // var blockRequest = {
      //   P2: "",
      //   P2: "BLOQUE",
      //   p3: "USER"
      // };
      // this.getModelData(blockRequest).then((resData) => {
      //   resData.data.to_pesal.forEach(element => {
      //     this.enableBlock(this.blockMap[element.C1], element.C2, true);
      //   });
      // }).catch((error) => {
      //   MessageBox.error(error);
      // });
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
          oControl.data("enabled", "true");
        } else if (!init) {
          oControl.data("enabled", "false");
          oControl.removeStyleClass("dashboardEnabled");
          oControl.addStyleClass("dashboardDisabled");
        }
      }
    },
    onPress: function (oEvent, param) {
      console.log("onPress: param");      
      this.getOwnerComponent().accionViewPanel.setBusy(true);
      if (oEvent.getSource().data("enabled") === "true") {
        switch (param) {
          case "C":
            this.manageActiveFlows(param).then(
              () => {
                this.activeAction = param;
                this.getOwnerComponent().currentMode = 1;
                this.navTo("RouteHeaderFlujosView");
              }).catch(() => {
              this.getOwnerComponent().accionViewPanel.setBusy(false)
            })
            break;
          case "S":
            this.getOwnerComponent().currentMode = 2;

            MessageBox.error(this.get18().getText("sinAutorizacion"));
            break;
          case "A":
            this.manageActiveFlows(param).then(
              () => {
                this.activeAction = param;
                this.getOwnerComponent().currentMode = 3;
                this.navTo("RouteApprovalView");
              })
            break;
          default:
            break;
        }
      } else {
        MessageBox.error(this.get18().getText("sinAutorizacion"));
      }
    },
    manageActiveFlows: function (accion) {
      return new Promise((resolve, reject) => {
        if (!this.getOwnerComponent().activeHeaderForFlow) return resolve();
        if (this.activeAction !== accion) {
          this.getOwnerComponent().activeHeaderForFlow.viewController.unregisterEvents();
          if (this.getOwnerComponent().activeFlow) {
            var that = this;
            MessageBox.warning("Cancelar el flujo activo?", {
              actions: ["Sí (perder datos)", "No"],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function (sAction) {
                if (sAction === "No") {
                  reject();
                } else {
                  that.getOwnerComponent().activeFlow.viewController.resetFlow();
                  resolve(MessageToast.show("Action selected: " + sAction));
                }
              }
            });
          } else {
            resolve();
          }
        } else {
          this.getOwnerComponent().activeHeaderForFlow.viewController.registerEvents();
          resolve();
        }
      });
    },
  });
});